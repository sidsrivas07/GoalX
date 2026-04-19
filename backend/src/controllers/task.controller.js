import prisma from '../utils/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/tasks?date=YYYY-MM-DD
 * Fetch all categories and their nested tasks for a specific date
 */
export const getTasksByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    throw new ApiError(400, 'Date query parameter is required (YYYY-MM-DD)');
  }

  // Parse strings to create DateTime bounds for SQLite compatibility
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    throw new ApiError(400, 'Invalid date format');
  }

  const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

  const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
    select: {
      id: true,
      name: true,
      accentColor: true,
      tasks: {
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { time: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json(
    new ApiResponse(200, categories, 'Tasks for date retrieved successfully')
  );
});

/**
 * POST /api/tasks
 * Create a new task in a specific category
 */
export const createTask = asyncHandler(async (req, res) => {
  const { name, time, duration, date, categoryId } = req.body;

  if (!name || !time || !duration || !date || !categoryId) {
    throw new ApiError(400, 'Please provide all required task fields');
  }

  // Security: Verify category belongs to the logged-in user
  const category = await prisma.category.findFirst({
    where: { 
      id: categoryId,
      userId: req.user.id 
    },
  });

  if (!category) {
    throw new ApiError(403, 'Category not found or does not belong to you');
  }

  const parsedDate = new Date(date);
  // Optional: Set date time to 00:00:00 to purely represent the day component
  parsedDate.setUTCHours(12, 0, 0, 0); 

  const task = await prisma.task.create({
    data: {
      name,
      time: new Date(time),
      duration: parseInt(duration),
      date: parsedDate,
      categoryId,
    },
  });

  res.status(201).json(
    new ApiResponse(201, task, 'Task created successfully')
  );
});

/**
 * PATCH /api/tasks/:id/status
 * Toggle a task between PENDING and COMPLETED
 */
export const toggleTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Security check using relational filtering
  const task = await prisma.task.findFirst({
    where: {
      id,
      category: {
        userId: req.user.id
      }
    }
  });

  if (!task) {
    throw new ApiError(404, 'Task not found or access denied');
  }

  const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status: newStatus },
  });

  res.status(200).json(
    new ApiResponse(200, updatedTask, 'Task status updated')
  );
});

/**
 * DELETE /api/tasks/:id
 * Delete a specific task belonging to the user
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await prisma.task.findFirst({
    where: {
      id,
      category: {
        userId: req.user.id
      }
    }
  });

  if (!task) {
    throw new ApiError(404, 'Task not found or access denied');
  }

  await prisma.task.delete({
    where: { id },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Task deleted successfully')
  );
});

/**
 * PATCH /api/tasks/:id
 * Update a task's details (name, time, etc.)
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, time, duration } = req.body;

  const task = await prisma.task.findFirst({
    where: {
      id,
      category: { userId: req.user.id }
    }
  });

  if (!task) {
    throw new ApiError(404, 'Task not found or access denied');
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      name: name !== undefined ? name : task.name,
      time: time !== undefined ? new Date(time) : task.time,
      duration: duration !== undefined ? parseInt(duration) : task.duration,
    },
  });

  res.status(200).json(
    new ApiResponse(200, updatedTask, 'Task updated successfully')
  );
});
