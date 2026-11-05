import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, _next) {
  if (err?.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File exceeds the ${process.env.MAX_FILE_SIZE_MB || 5}MB limit.`
        : 'The file could not be uploaded.';
    return res.status(400).json({ success: false, message });
  }

  if (err?.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((item) => item.message);
    return res.status(400).json({
      success: false,
      message: details[0] || 'Validation failed.',
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
  }

  if (err?.name === 'CastError' || err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, message: 'Invalid identifier.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const exposeMessage = err.isOperational === true || (statusCode < 500 && err.message);
  const message = exposeMessage
    ? err.message
    : 'Something went wrong. Please try again.';

  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err.message);
  }

  return res.status(statusCode).json({ success: false, message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} was not found.` });
}

export function assertObjectId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid identifier.', 400);
  }
}
