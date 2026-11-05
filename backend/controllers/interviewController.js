import { Analysis } from '../models/Analysis.js';
import { Resume } from '../models/Resume.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { generateInterviewQuestions, suggestAnswer } from '../services/geminiService.js';
import { findOwned } from '../utils/ownership.js';

async function loadContext(analysis) {
  const resume = await Resume.findOne({ _id: analysis.resumeId, userId: analysis.userId });
  return {
    resumeText: resume?.extractedText || '',
    jobDescription: analysis.jobDescription,
  };
}

export const generateMore = asyncHandler(async (req, res) => {
  const analysis = await findOwned(Analysis, req.body.analysisId, req.user._id, 'Analysis');
  const { resumeText, jobDescription } = await loadContext(analysis);
  if (!resumeText) {
    throw new AppError('The original resume text is no longer available. Upload the resume again.', 400);
  }
  const questions = await generateInterviewQuestions(resumeText, jobDescription, analysis.interviewQuestions);
  analysis.interviewQuestions.push(...questions);
  if (analysis.interviewQuestions.length > 60) {
    analysis.interviewQuestions = analysis.interviewQuestions.slice(-60);
  }
  await analysis.save();
  sendSuccess(res, {
    message: 'Additional interview questions generated.',
    data: { questions, analysis },
  });
});

export const answerQuestion = asyncHandler(async (req, res) => {
  const question = String(req.body.question || '').trim();
  if (question.length < 8 || question.length > 500) {
    throw new AppError('Enter a question between 8 and 500 characters.', 400);
  }
  const analysis = await findOwned(Analysis, req.body.analysisId, req.user._id, 'Analysis');
  const { resumeText, jobDescription } = await loadContext(analysis);
  const answer = await suggestAnswer({ question, resumeText, jobDescription });
  sendSuccess(res, { data: { answer } });
});
