import prisma from '../utils/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/categories
 * Create a new category for the logged-in user
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, accentColor } = req.body;

  if (!name) {
    throw new ApiError(400, 'Category name is required');
  }

  const category = await prisma.category.create({
    data: {
      name,
      accentColor: accentColor || '#ff6b00',
      userId: req.user.id,
    },
  });

  res.status(201).json(
    new ApiResponse(201, category, 'Category created successfully')
  );
});

/**
 * GET /api/categories
 * Get all categories for the logged-in user
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json(
    new ApiResponse(200, categories, 'Categories retrieved successfully')
  );
});
/**
 * DELETE /api/categories/:id
 * Delete a category and all its tasks (cascades via Prisma)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId: req.user.id
    }
  });

  if (!category) {
    throw new ApiError(404, 'Category not found or access denied');
  }

  await prisma.category.delete({
    where: { id }
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Category deleted successfully')
  );
});
