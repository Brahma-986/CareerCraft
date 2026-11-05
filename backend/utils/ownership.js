import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export async function findOwned(Model, id, userId, label = 'Resource') {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid identifier.', 400);
  }
  const document = await Model.findOne({ _id: id, userId });
  if (!document) {
    throw new AppError(`${label} not found.`, 404);
  }
  return document;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = [];
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (cleanName.length < 2 || cleanName.length > 80) errors.push('Name must be between 2 and 80 characters.');
  if (!EMAIL_PATTERN.test(cleanEmail)) errors.push('Enter a valid email address.');
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    errors.push('Password must be between 8 and 72 characters.');
  }
  if (confirmPassword !== undefined && confirmPassword !== password) {
    errors.push('Passwords do not match.');
  }
  if (errors.length) throw new AppError(errors[0], 400);
  return { name: cleanName, email: cleanEmail, password };
}

export function validateLogin({ email, password }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!EMAIL_PATTERN.test(cleanEmail) || typeof password !== 'string' || !password) {
    throw new AppError('Invalid email or password.', 401);
  }
  return { email: cleanEmail, password };
}

export function validateJobDescription(value) {
  const jobDescription = String(value || '').trim();
  if (jobDescription.length < 40) {
    throw new AppError('Job description must be at least 40 characters.', 400);
  }
  if (jobDescription.length > 20000) {
    throw new AppError('Job description must be 20000 characters or fewer.', 400);
  }
  return jobDescription;
}

export function safeFileName(name) {
  const base = String(name || 'resume.pdf').split(/[/\\]/).pop();
  return base.replace(/[^\w.\- ()]/g, '').slice(0, 180) || 'resume.pdf';
}
