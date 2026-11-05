import { Resume } from '../models/Resume.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { extractPdfText } from '../services/pdfService.js';
import { removeUploadedFile } from '../middleware/upload.js';
import { findOwned, safeFileName } from '../utils/ownership.js';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Choose a PDF resume to upload.', 400);
  try {
    const extracted = await extractPdfText(req.file.path);
    const resume = await Resume.create({
      userId: req.user._id,
      originalFileName: safeFileName(req.file.originalname),
      extractedText: extracted.text,
      textLength: extracted.textLength,
    });
    sendSuccess(res, {
      status: 201,
      message: 'Resume uploaded and text extracted.',
      data: {
        resume: {
          id: resume._id,
          originalFileName: resume.originalFileName,
          textLength: resume.textLength,
          uploadedAt: resume.uploadedAt,
          preview: resume.extractedText.slice(0, 400),
        },
      },
    });
  } finally {
    await removeUploadedFile(req.file.path);
  }
});

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('originalFileName textLength uploadedAt createdAt');
  sendSuccess(res, { data: { resumes } });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await findOwned(Resume, req.params.id, req.user._id, 'Resume');
  sendSuccess(res, {
    data: {
      resume: {
        id: resume._id,
        originalFileName: resume.originalFileName,
        extractedText: resume.extractedText,
        textLength: resume.textLength,
        uploadedAt: resume.uploadedAt,
      },
    },
  });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await findOwned(Resume, req.params.id, req.user._id, 'Resume');
  await resume.deleteOne();
  sendSuccess(res, { message: 'Resume deleted.' });
});
