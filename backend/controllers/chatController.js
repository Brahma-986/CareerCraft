import { Analysis } from '../models/Analysis.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { careerChat } from '../services/geminiService.js';
import { findOwned } from '../utils/ownership.js';

export const chat = asyncHandler(async (req, res) => {
  let context = '';
  if (req.body.analysisId) {
    const analysis = await findOwned(Analysis, req.body.analysisId, req.user._id, 'Analysis');
    context = [
      `Match score: ${analysis.matchScore}`,
      `Summary: ${analysis.summary}`,
      `Matching skills: ${analysis.matchingSkills.join(', ')}`,
      `Missing skills: ${analysis.missingSkills.map((item) => item.skill).join(', ')}`,
      `Suggestions: ${analysis.improvementSuggestions.join(' | ')}`,
      `Job description excerpt: ${analysis.jobDescription.slice(0, 1500)}`,
    ].join('\n');
  }

  const reply = await careerChat({
    message: req.body.message,
    history: req.body.history,
    context,
  });
  sendSuccess(res, { data: { reply } });
});
