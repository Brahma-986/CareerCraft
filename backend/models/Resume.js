import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    extractedText: {
      type: String,
      required: true,
    },
    textLength: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model('Resume', resumeSchema);
