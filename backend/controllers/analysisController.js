import { Analysis } from '../models/Analysis.js';
import { Resume } from '../models/Resume.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { analyzeResume, generateInterviewQuestions } from '../services/geminiService.js';
import { findOwned, validateJobDescription } from '../utils/ownership.js';

export const createAnalysis = asyncHandler(async (req, res) => {
  const resume = await findOwned(Resume, req.body.resumeId, req.user._id, 'Resume');
  const jobDescription = validateJobDescription(req.body.jobDescription);
  const result = await analyzeResume(resume.extractedText, jobDescription);

  let interviewQuestions = [];
  let interviewWarning = '';
  try {
    interviewQuestions = await generateInterviewQuestions(resume.extractedText, jobDescription);
  } catch (error) {
    interviewWarning = error.statusCode === 503 ? error.message : 'Interview questions could not be generated. You can generate them from the interview page.';
  }

  const analysis = await Analysis.create({
    userId: req.user._id,
    resumeId: resume._id,
    resumeFileName: resume.originalFileName,
    jobDescription,
    interviewQuestions,
    ...result,
  });

  sendSuccess(res, {
    status: 201,
    message: interviewWarning ? `Analysis saved. ${interviewWarning}` : 'Resume analysis completed.',
    data: { analysis },
  });
});

export const listAnalyses = asyncHandler(async (req, res) => {
  const analyses = await Analysis.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('resumeFileName matchScore jobDescription createdAt matchingSkills missingSkills');
  sendSuccess(res, { data: { analyses } });
});

export const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await findOwned(Analysis, req.params.id, req.user._id, 'Analysis');
  sendSuccess(res, { data: { analysis } });
});

export const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await findOwned(Analysis, req.params.id, req.user._id, 'Analysis');
  await analysis.deleteOne();
  sendSuccess(res, { message: 'Analysis deleted.' });
});
