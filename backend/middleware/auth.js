import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getJwtSecret } from '../config/env.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication required.', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired. Please log in again.', 401);
    }
    throw new AppError('Invalid authentication token.', 401);
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError('Authentication required.', 401);
  }
  req.user = user;
  next();
});
