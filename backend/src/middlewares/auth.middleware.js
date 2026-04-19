import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware to protect routes by verifying JWT.
 * Expects token in Authorization header: `Bearer <token>`
 */
export const protect = asyncHandler(async (req, res, next) => {
  // Authentication Removed: Always use the Global Anonymous User
  req.user = { id: '00000000-0000-0000-0000-000000000000' };
  next();
});
