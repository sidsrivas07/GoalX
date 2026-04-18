import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Helper to generate a JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/signup
 * Register a new user
 */
export const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  const token = generateToken(user.id);

  res.status(201).json(
    new ApiResponse(201, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    }, 'User registered successfully')
  );
});

/**
 * POST /api/auth/login
 * Authenticate existing user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user.id);

  res.status(200).json(
    new ApiResponse(200, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    }, 'Login successful')
  );
});

/**
 * GET /api/auth/me
 * Get current user data (protected)
 */
export const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the authMiddleware
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      preferences: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, user, 'User details retrieved')
  );
});
