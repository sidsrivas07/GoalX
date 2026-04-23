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

  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];
  const userApiKey = req.headers['x-gemini-key'];
  
  // 1. Get structured schedule from AI
  const aiResponse = await generateSchedule(prompt, todayDateStr, userApiKey);

  if (!aiResponse || !aiResponse.categories || aiResponse.categories.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "AI returned no tasks for this request."));
  }

  const createdTasks = [];

  // 2. Iterate through categories
  for (const catGroup of aiResponse.categories) {
    const categoryName = catGroup.category || 'Personal';
    
    // Find or create category for this user
    let category = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        name: {
          equals: categoryName,
          mode: 'insensitive'
        }
      }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          userId: req.user.id,
          accentColor: categoryName === 'Workout' ? '#10B981' : (categoryName === 'Academics' ? '#6366F1' : '#F59E0B')
        }
      });
    }

    // 3. Create tasks within this category
    for (const t of catGroup.tasks) {
      // Parse 24h time "HH:MM"
      let hours = 12, mins = 0;
      if (t.time && t.time.includes(':')) {
        const parts = t.time.split(':').map(n => parseInt(n));
        if (!isNaN(parts[0])) hours = parts[0];
        if (!isNaN(parts[1])) mins = parts[1];
      }

      const taskDate = new Date(todayDateStr);
      taskDate.setUTCHours(12, 0, 0, 0);

      const taskTime = new Date(taskDate);
      taskTime.setUTCHours(hours, mins, 0, 0);

      const newTask = await prisma.task.create({
        data: {
          name: t.title,
          time: taskTime,
          duration: t.duration || 60,
          date: taskDate,
          status: 'PENDING',
          isAiGenerated: true,
          categoryId: category.id,
          categoryType: categoryName.toUpperCase(),
          recurrence: 'NONE',
          editable: true
        }
      });


      createdTasks.push(newTask);
    }
  }

  // 4. Return structured response for frontend rendering
  res.status(201).json(
    new ApiResponse(201, { 
      count: createdTasks.length,
      plan: aiResponse 
    }, "AI Schedule successfully applied and categorized")
  );
});

