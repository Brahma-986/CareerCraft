import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user.toSafeObject() } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, email, currentPassword, newPassword } = req.body;

  if (name !== undefined) {
    const cleanName = String(name).trim();
    if (cleanName.length < 2 || cleanName.length > 80) {
      throw new AppError('Name must be between 2 and 80 characters.', 400);
    }
    user.name = cleanName;
  }

  if (email !== undefined) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      throw new AppError('Enter a valid email address.', 400);
    }
    if (cleanEmail !== user.email) {
      const taken = await User.findOne({ email: cleanEmail });
      if (taken) throw new AppError('An account with this email already exists.', 409);
      user.email = cleanEmail;
    }
  }

  if (newPassword !== undefined && newPassword !== '') {
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 72) {
      throw new AppError('New password must be between 8 and 72 characters.', 400);
    }
    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect.', 400);
    }
    user.password = newPassword;
  }

  await user.save();
  sendSuccess(res, {
    message: 'Profile updated.',
    data: { user: user.toSafeObject() },
  });
});
