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

  // 1. Get today's local date and potential user-provided API key from the header
  const todayDateStr = new Date().toISOString().split('T')[0];
  const userApiKey = req.headers['x-gemini-key'];
  
  // 2. Query Gemini
  const aiResult = await generateSchedule(prompt, todayDateStr, userApiKey);

  const { categoryName, tasks } = aiResult;

  if (!tasks || tasks.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "AI returned no tasks for this request."));
  }

  // 3. Resolve Category (Find existing by name for this user, or Create)
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
        // Optional default random accent color or hardcoded
        accentColor: '#3B82F6' 
      }
    });
  }

  // 4. Parse Dates and Insert Tasks
  const rawDataForInsert = tasks.map(t => {
    // Convert "8:00 AM", "YYYY-MM-DD" to standard JS Date for SQLite
    const parsedDate = new Date(`${t.date}T12:00:00Z`); // the normalized date representation
    
    // Parse time
    const timeParts = t.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    let isoTime = new Date(parsedDate);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const mins = parseInt(timeParts[2]);
      const ampm = timeParts[3] ? timeParts[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      isoTime.setUTCHours(hours, mins, 0, 0); // Need to store in UTC to play nice with dates
    }

    return {
      name: t.name,
      duration: t.duration || 30,
      time: isoTime,
      date: parsedDate,
      isAiGenerated: true,
      categoryId: category.id
    };
  });

  // Bulk Insert
  await prisma.task.createMany({
    data: rawDataForInsert
  });

  res.status(201).json(
    new ApiResponse(201, { categoryName, tasksCreated: tasks.length }, "AI Schedule successfully applied")
  );
});
