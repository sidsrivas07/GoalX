import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware to protect routes by verifying JWT.
 * Expects token in Authorization header: `Bearer <token>`
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, token failed or missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user ID to the request object
    // In a full implementation, you might want to fetch the whole user from DB here
    req.user = { id: decoded.id };
    
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }
});
