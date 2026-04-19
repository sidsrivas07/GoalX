import prisma from '../utils/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/tasks?date=YYYY-MM-DD
 * Fetch all categories and their nested tasks for a specific date
 * MERGES: Date-specific tasks AND Daily Recurring tasks
 */
export const getTasksByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    throw new ApiError(400, 'Date query parameter is required (YYYY-MM-DD)');
  }

  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
    select: {
      id: true,
      name: true,
      accentColor: true,
      tasks: {
        where: {
          OR: [
            {
              date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            {
              recurrence: 'DAILY'
            }
          ]
        },
        orderBy: { time: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Post-process tasks to determine 'status' for DAILY tasks
  // If task is DAILY and lastCompletedDate matches targetDate, it's COMPLETED for the view.
  const categoriesWithStatus = categories.map(cat => ({
    ...cat,
    tasks: cat.tasks.map(task => {
      if (task.recurrence === 'DAILY') {
        const lastDate = task.lastCompletedDate ? new Date(task.lastCompletedDate).toISOString().split('T')[0] : null;
        const viewDate = date; // YYYY-MM-DD
        return {
          ...task,
          status: (lastDate === viewDate) ? 'COMPLETED' : 'PENDING'
        };
      }
      return task;
    })
  }));

  res.status(200).json(
    new ApiResponse(200, categoriesWithStatus, 'Tasks for date retrieved successfully')
  );
});

/**
 * POST /api/tasks
 */
export const createTask = asyncHandler(async (req, res) => {
  const { name, time, duration, date, categoryId, recurrence, categoryType } = req.body;

  if (!name || !time || !duration || !date || !categoryId) {
    throw new ApiError(400, 'Please provide all required task fields');
  }

  const category = await prisma.category.findFirst({
    where: { 
      id: categoryId,
      userId: req.user.id 
    },
  });

  if (!category) {
    throw new ApiError(403, 'Category not found or access denied');
  }

  const parsedDate = new Date(date);
  parsedDate.setUTCHours(12, 0, 0, 0); 

  const task = await prisma.task.create({
    data: {
      name,
      time: new Date(time),
      duration: parseInt(duration),
      date: parsedDate,
      categoryId,
      recurrence: recurrence || 'NONE',
      categoryType: categoryType || 'MISC',
      editable: true
    },
  });

  res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
});

/**
 * PATCH /api/tasks/:id/status
 * Handle status toggle with date-sensitivity for recurring tasks
 */
export const toggleTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.body; // The view date the user is toggling on

  const task = await prisma.task.findFirst({
    where: {
      id,
      category: { userId: req.user.id }
    }
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  if (task.recurrence === 'DAILY') {
    if (!date) throw new ApiError(400, "Daily tasks require a date to toggle status");
    
    // Check if it's currently completed for this date
    const lastDate = task.lastCompletedDate ? new Date(task.lastCompletedDate).toISOString().split('T')[0] : null;
    const isCurrentlyDone = (lastDate === date);
    const viewDate = new Date(date);

    let nextStreak = task.currentStreak;
    if (!isCurrentlyDone) {
      // Logic for Incrementing Streak
      const yesterday = new Date(viewDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        nextStreak = (task.currentStreak || 0) + 1;
      } else {
        nextStreak = 1;
      }
    } else {
      // Logic for Unchecking
      nextStreak = Math.max(0, (task.currentStreak || 1) - 1);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        lastCompletedDate: isCurrentlyDone ? null : new Date(`${date}T12:00:00Z`),
        currentStreak: nextStreak,
        longestStreak: Math.max(task.longestStreak || 0, nextStreak)
      }
    });

    return res.status(200).json(new ApiResponse(200, updatedTask, 'Daily task status toggled'));
  }

  // Normal task logic
  const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status: newStatus }
  });

  res.status(200).json(new ApiResponse(200, updatedTask, 'Task status updated'));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.findFirst({
    where: { id, category: { userId: req.user.id } }
  });

  if (!task) throw new ApiError(404, 'Task not found');

  await prisma.task.delete({ where: { id } });
  res.status(200).json(new ApiResponse(200, null, 'Task deleted successfully'));
});

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, time, duration } = req.body;

  const task = await prisma.task.findFirst({
    where: { id, category: { userId: req.user.id } }
  });

  if (!task) throw new ApiError(404, 'Task not found');

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      name: name !== undefined ? name : task.name,
      time: time !== undefined ? new Date(time) : task.time,
      duration: duration !== undefined ? parseInt(duration) : task.duration,
    },
  });

  res.status(200).json(new ApiResponse(200, updatedTask, 'Task updated successfully'));
});
