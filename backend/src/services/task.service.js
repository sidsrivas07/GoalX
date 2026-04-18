/**
 * Task Service
 *
 * Business logic for task operations.
 * Demonstrates how to use the Prisma client for common queries.
 */
import prisma from '../utils/prisma.js';

/**
 * Fetch all tasks for a specific date, grouped by category.
 *
 * @param {string} userId - The user's UUID
 * @param {string} dateStr - ISO date string (e.g., "2026-04-19")
 * @returns {Promise<Array>} Categories with their tasks for that date
 *
 * Example usage:
 *   const schedule = await getTasksByDate(userId, '2026-04-19');
 */
export async function getTasksByDate(userId, dateStr) {
  const targetDate = new Date(dateStr);

  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      tasks: {
        where: { date: targetDate },
        orderBy: { time: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return categories;
}

/**
 * Create a new task inside a category.
 *
 * @param {object} taskData - { name, time, duration, date, categoryId, isAiGenerated }
 * @returns {Promise<object>} The created task
 */
export async function createTask(taskData) {
  const task = await prisma.task.create({
    data: {
      name: taskData.name,
      time: new Date(taskData.time),
      duration: taskData.duration,
      date: new Date(taskData.date),
      isAiGenerated: taskData.isAiGenerated || false,
      categoryId: taskData.categoryId,
    },
  });

  return task;
}

/**
 * Toggle a task's status between PENDING and COMPLETED.
 *
 * @param {string} taskId - The task's UUID
 * @returns {Promise<object>} The updated task
 */
export async function toggleTaskStatus(taskId) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';

  return prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });
}

/**
 * Delete a task by ID.
 *
 * @param {string} taskId - The task's UUID
 * @returns {Promise<object>} The deleted task
 */
export async function deleteTask(taskId) {
  return prisma.task.delete({ where: { id: taskId } });
}

/**
 * Get stats for a user: total tasks, completed, pending.
 *
 * @param {string} userId - The user's UUID
 * @returns {Promise<object>} { total, completed, pending }
 */
export async function getUserStats(userId) {
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true },
  });

  const categoryIds = categories.map(c => c.id);

  const [total, completed] = await Promise.all([
    prisma.task.count({ where: { categoryId: { in: categoryIds } } }),
    prisma.task.count({ where: { categoryId: { in: categoryIds }, status: 'COMPLETED' } }),
  ]);

  return { total, completed, pending: total - completed };
}
