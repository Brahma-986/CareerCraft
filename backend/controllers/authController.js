import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { getJwtSecret } from '../config/env.js';
import { validateLogin, validateRegistration } from '../utils/ownership.js';

function signToken(userId) {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = validateRegistration(req.body);
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }
  const user = await User.create({ name, email, password });
  sendSuccess(res, {
    status: 201,
    message: 'Account created.',
    data: { user: user.toSafeObject(), token: signToken(user._id) },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLogin(req.body);
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }
  sendSuccess(res, {
    message: 'Logged in.',
    data: { user: user.toSafeObject(), token: signToken(user._id) },
  });
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user.toSafeObject() } });
});
