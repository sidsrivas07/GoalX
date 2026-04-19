import prisma from '../utils/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateSchedule } from '../services/ai.service.js';

export const generatePlan = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new ApiError(400, "Prompt is required");
  }

  // 1. Get today's local date/time context
  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];
  const userApiKey = req.headers['x-gemini-key'];
  
  // 2. Query Gemini with the advanced prompt
  const tasks = await generateSchedule(prompt, todayDateStr, userApiKey);

  if (!tasks || tasks.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "AI returned no tasks for this request."));
  }

  // 3. Process each task and resolve its category
  // We'll map the AI categories to user-friendly names
  const categoryMap = {
    'DAILY': 'Daily Habits',
    'FESTIVAL': 'Festivals',
    'MISC': 'General Tasks'
  };

  const createdTasks = [];

  for (const t of tasks) {
    const categoryName = categoryMap[t.categoryType] || 'Miscellaneous';
    
    // Find or create category
    let category = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        name: categoryName
      }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          userId: req.user.id,
          accentColor: t.categoryType === 'DAILY' ? '#ff6b00' : (t.categoryType === 'FESTIVAL' ? '#e11d48' : '#3B82F6')
        }
      });
    }

    // Parse 24h time "HH:MM"
    const [hours, mins] = t.time.split(':').map(n => parseInt(n));
    
    // For specific date, use today or the AI-specified date
    // Note: If recurrence is DAILY, the date field is less critical for the master record
    // but the getTasksByDate query will still use it.
    const taskDate = new Date(todayDateStr);
    taskDate.setUTCHours(12, 0, 0, 0);

    const taskTime = new Date(taskDate);
    taskTime.setUTCHours(hours, mins, 0, 0);

    const newTask = await prisma.task.create({
      data: {
        name: t.name,
        time: taskTime,
        duration: t.duration || 60,
        date: taskDate,
        status: t.status || 'PENDING',
        isAiGenerated: true,
        categoryId: category.id,
        categoryType: t.categoryType || 'MISC',
        recurrence: t.recurrence || 'NONE',
        editable: t.editable !== undefined ? t.editable : true
      }
    });

    createdTasks.push(newTask);
  }

  res.status(201).json(
    new ApiResponse(201, { count: createdTasks.length }, "AI Schedule successfully applied")
  );
});
