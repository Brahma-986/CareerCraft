import { Analysis } from '../models/Analysis.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const analyses = await Analysis.find({ userId }).sort({ createdAt: -1 });
  const totalAnalyses = analyses.length;
  const averageMatchScore = totalAnalyses
    ? Math.round(analyses.reduce((sum, item) => sum + item.matchScore, 0) / totalAnalyses)
    : null;
  const interviewsGenerated = analyses.reduce(
    (sum, item) => sum + (item.interviewQuestions?.length || 0),
    0
  );

  const activity = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const count = analyses.filter((item) => item.createdAt >= day && item.createdAt < next).length;
    activity.push({
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
    });
  }

  const latest = analyses[0];
  sendSuccess(res, {
    data: {
      totalAnalyses,
      averageMatchScore,
      interviewsGenerated,
      resumesAnalyzed: new Set(analyses.map((item) => String(item.resumeId))).size,
      activity,
      recent: analyses.slice(0, 5).map((item) => ({
        id: item._id,
        resumeFileName: item.resumeFileName,
        matchScore: item.matchScore,
        createdAt: item.createdAt,
        jobExcerpt: item.jobDescription.slice(0, 140),
      })),
      recommendations: latest
        ? {
            analysisId: latest._id,
            suggestions: latest.improvementSuggestions.slice(0, 4),
            recommendedSkills: latest.recommendedSkills.slice(0, 6),
          }
        : null,
    },
  });
});
