import { AppError } from '../utils/AppError.js';

const PRIORITIES = new Set(['high', 'medium', 'low']);
const CATEGORIES = new Set(['technical', 'hr', 'project']);
const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

export function parseModelJson(text) {
  if (!text || typeof text !== 'string') {
    throw new AppError('The AI response was empty. Please try again.', 502);
  }
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced?.[1] || trimmed.match(/\{[\s\S]*\}/)?.[0];
    if (!candidate) {
      throw new AppError('The AI response was not valid JSON. Please try again.', 502);
    }
    try {
      return JSON.parse(candidate);
    } catch {
      throw new AppError('The AI response was not valid JSON. Please try again.', 502);
    }
  }
}

function asString(value, max = 2000) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

function asStringList(value, maxItems = 12, maxLength = 240) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new AppError('The AI response did not include a valid match score.', 502);
  }
  return Math.max(0, Math.min(100, Math.round(number)));
}

export function normalizeAnalysis(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new AppError('The AI response could not be validated.', 502);
  }

  const missingSkills = Array.isArray(raw.missingSkills)
    ? raw.missingSkills
        .map((item) => {
          if (typeof item === 'string') {
            return { skill: asString(item, 80), priority: 'medium', reason: '' };
          }
          const skill = asString(item?.skill, 80);
          if (!skill) return null;
          const priority = PRIORITIES.has(item?.priority) ? item.priority : 'medium';
          return { skill, priority, reason: asString(item?.reason, 300) };
        })
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const improvements = raw.resumeImprovements && typeof raw.resumeImprovements === 'object'
    ? raw.resumeImprovements
    : {};

  return {
    matchScore: clampScore(raw.matchScore),
    summary: asString(raw.summary, 1200),
    matchingSkills: asStringList(raw.matchingSkills, 20, 80),
    missingSkills,
    strengths: asStringList(raw.strengths, 8, 300),
    weaknesses: asStringList(raw.weaknesses, 8, 300),
    experienceAnalysis: asString(raw.experienceAnalysis, 1500),
    educationAnalysis: asString(raw.educationAnalysis, 1200),
    improvementSuggestions: asStringList(raw.improvementSuggestions, 10, 400),
    recommendedSkills: asStringList(raw.recommendedSkills, 12, 80),
    resumeImprovements: {
      professionalSummary: asString(improvements.professionalSummary, 800),
      bulletPoints: asStringList(improvements.bulletPoints, 8, 300),
      actionVerbs: asStringList(improvements.actionVerbs, 12, 40),
      keywords: asStringList(improvements.keywords, 15, 60),
      formatting: asStringList(improvements.formatting, 8, 240),
      quantificationTips: asStringList(improvements.quantificationTips, 8, 300),
    },
  };
}

export function normalizeQuestions(raw) {
  const list = Array.isArray(raw) ? raw : raw?.questions;
  if (!Array.isArray(list)) {
    throw new AppError('The AI response did not include interview questions.', 502);
  }
  const questions = list
    .map((item) => {
      const question = asString(item?.question, 400);
      if (!question) return null;
      return {
        question,
        category: CATEGORIES.has(item?.category) ? item.category : 'technical',
        difficulty: DIFFICULTIES.has(item?.difficulty) ? item.difficulty : 'medium',
        suggestedAnswer: asString(item?.suggestedAnswer, 1600),
        relatedSkill: asString(item?.relatedSkill, 80),
      };
    })
    .filter(Boolean)
    .slice(0, 30);

  if (!questions.length) {
    throw new AppError('The AI response did not include interview questions.', 502);
  }
  return questions;
}

export function normalizeAnswer(raw) {
  const answer = asString(raw?.answer ?? raw, 2000);
  if (!answer) {
    throw new AppError('The AI response did not include an answer.', 502);
  }
  return answer;
}
