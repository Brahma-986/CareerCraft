import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { withDatabaseName } from '../config/db.js';
import { clampScore, normalizeAnalysis, normalizeQuestions, parseModelJson } from '../services/aiValidate.js';
import { assertExtractedText, assertPdfSignature } from '../services/pdfService.js';
import { validateJobDescription, validateRegistration } from '../utils/ownership.js';

describe('AI response validation', () => {
  it('parses fenced JSON', () => {
    const parsed = parseModelJson('```json\n{"matchScore":72}\n```');
    assert.equal(parsed.matchScore, 72);
  });

  it('rejects malformed JSON', () => {
    assert.throws(() => parseModelJson('not json'), /not valid JSON/);
  });

  it('clamps scores into 0-100', () => {
    assert.equal(clampScore(140), 100);
    assert.equal(clampScore(-4), 0);
    assert.equal(clampScore(72.4), 72);
  });

  it('normalizes a partial analysis without inventing list items', () => {
    const result = normalizeAnalysis({
      matchScore: 81,
      summary: '  Solid overlap  ',
      matchingSkills: ['JavaScript', ''],
      missingSkills: [{ skill: 'Kubernetes', priority: 'high', reason: 'Required in the posting' }],
      strengths: ['Clear project work'],
      weaknesses: 'not-an-array',
      resumeImprovements: { professionalSummary: 'Software engineer focused on JavaScript.' },
    });
    assert.equal(result.matchScore, 81);
    assert.deepEqual(result.matchingSkills, ['JavaScript']);
    assert.equal(result.missingSkills[0].priority, 'high');
    assert.deepEqual(result.weaknesses, []);
    assert.equal(result.resumeImprovements.professionalSummary.includes('JavaScript'), true);
  });

  it('normalizes interview questions and drops blanks', () => {
    const questions = normalizeQuestions({
      questions: [
        {
          question: 'How did you structure the React app?',
          category: 'project',
          difficulty: 'medium',
          suggestedAnswer: 'Describe the actual architecture shown in the resume.',
          relatedSkill: 'React',
        },
        { question: '   ' },
      ],
    });
    assert.equal(questions.length, 1);
    assert.equal(questions[0].category, 'project');
  });
});

describe('database URI', () => {
  it('adds the careercraft database when the URI has no path', () => {
    const uri = 'mongodb+srv://user:secret@cluster.example.net/?retryWrites=true';
    assert.equal(
      withDatabaseName(uri),
      'mongodb+srv://user:secret@cluster.example.net/careercraft?retryWrites=true'
    );
  });

  it('keeps an explicit database name', () => {
    const uri = 'mongodb://127.0.0.1:27017/otherdb';
    assert.equal(withDatabaseName(uri), uri);
  });
});

describe('input guards', () => {
  it('rejects a short job description', () => {
    assert.throws(() => validateJobDescription('too short'), /at least 40/);
  });

  it('rejects mismatched passwords', () => {
    assert.throws(
      () => validateRegistration({
        name: 'Ava Shah',
        email: 'ava@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      }),
      /do not match/i
    );
  });

  it('rejects files that are not PDFs and scanned-style text', () => {
    assert.throws(() => assertPdfSignature(Buffer.from('hello')), /not a valid PDF/);
    assert.throws(() => assertExtractedText('   '), /selectable text/);
  });
});
