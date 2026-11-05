import mongoose from 'mongoose';

const missingSkillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const improvementSchema = new mongoose.Schema(
  {
    professionalSummary: { type: String, default: '' },
    bulletPoints: { type: [String], default: [] },
    actionVerbs: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    formatting: { type: [String], default: [] },
    quantificationTips: { type: [String], default: [] },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, enum: ['technical', 'hr', 'project'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    suggestedAnswer: { type: String, default: '' },
    relatedSkill: { type: String, default: '' },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    resumeFileName: { type: String, default: '' },
    jobDescription: { type: String, required: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, default: '' },
    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [missingSkillSchema], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    experienceAnalysis: { type: String, default: '' },
    educationAnalysis: { type: String, default: '' },
    improvementSuggestions: { type: [String], default: [] },
    recommendedSkills: { type: [String], default: [] },
    resumeImprovements: { type: improvementSchema, default: () => ({}) },
    interviewQuestions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ resumeId: 1 });

export const Analysis = mongoose.model('Analysis', analysisSchema);
