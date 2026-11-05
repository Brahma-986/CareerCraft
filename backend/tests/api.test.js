import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.GEMINI_MODEL = 'gemini-3.5-flash';

const sampleAnalysis = {
  matchScore: 76,
  summary: 'The resume shows JavaScript and React experience that overlaps with the role.',
  matchingSkills: ['JavaScript', 'React'],
  missingSkills: [{ skill: 'Kubernetes', priority: 'high', reason: 'Listed as a requirement and not shown on the resume.' }],
  strengths: ['Relevant frontend projects are described.'],
  weaknesses: ['Cloud deployment experience is not shown.'],
  experienceAnalysis: 'The resume describes software engineering work. Dates are limited.',
  educationAnalysis: 'A bachelor degree is listed.',
  improvementSuggestions: ['Add measurable outcomes only where you have them.'],
  recommendedSkills: ['Kubernetes'],
  resumeImprovements: {
    professionalSummary: 'Software engineer with experience building React and Node.js applications.',
    bulletPoints: ['Built a React interface for a Node.js API described in the resume.'],
    actionVerbs: ['Built', 'Designed'],
    keywords: ['React', 'Node.js'],
    formatting: ['Keep each role to concise bullets.'],
    quantificationTips: ['Add numbers only for results you can verify, such as users supported or pages shipped.'],
  },
};

const sampleQuestions = {
  questions: [
    {
      question: 'How does React state flow through the projects on your resume?',
      category: 'technical',
      difficulty: 'medium',
      suggestedAnswer: 'Explain the state approach you actually used. Do not add tools that are not on the resume.',
      relatedSkill: 'React',
    },
    {
      question: 'Tell me about a time you handled feedback.',
      category: 'hr',
      difficulty: 'easy',
      suggestedAnswer: 'Use a real example. If none is on the resume, describe the situation without inventing an employer.',
      relatedSkill: 'Communication',
    },
    {
      question: 'Walk through one project listed on your resume.',
      category: 'project',
      difficulty: 'medium',
      suggestedAnswer: 'Pick a project that is actually listed and describe your contribution.',
      relatedSkill: 'Projects',
    },
  ],
};

let mongo;
let app;
let token;
let otherToken;
let resumeId;
let analysisId;

async function makePdf(text) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const lines = text.match(/.{1,80}/g) || [text];
  lines.forEach((line, index) => {
    page.drawText(line, { x: 48, y: 740 - index * 18, size: 12, font });
  });
  return Buffer.from(await doc.save());
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const mod = await import('../app.js');
  app = mod.default;
  const gemini = await import('../services/geminiService.js');
  gemini.setGeminiClientForTests({
    models: {
      async generateContent({ config, contents }) {
        const system = String(config?.systemInstruction || '');
        const prompt = String(contents || '');
        if (prompt.includes('FORCE_BAD_JSON')) return { text: 'this is not json' };
        if (system.includes('TASK:interview')) return { text: JSON.stringify(sampleQuestions) };
        if (system.includes('TASK:answer')) {
          return { text: JSON.stringify({ answer: 'Use a real example from the resume and skip any metric you cannot verify.' }) };
        }
        if (system.includes('TASK:chat')) return { text: 'Focus on skills the job asks for that are missing from your saved analysis.' };
        return { text: JSON.stringify(sampleAnalysis) };
      },
    },
  });
});

after(async () => {
  const gemini = await import('../services/geminiService.js');
  gemini.resetGeminiClientForTests();
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe('CareerCraft API', () => {
  it('responds to the health check', async () => {
    const response = await request(app).get('/api/health');
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.database, 'connected');
  });

  it('registers, rejects duplicates, and logs in', async () => {
    const created = await request(app).post('/api/auth/register').send({
      name: 'Ava Shah',
      email: 'ava@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.user.password, undefined);
    token = created.body.data.token;

    const duplicate = await request(app).post('/api/auth/register').send({
      name: 'Ava Shah',
      email: 'ava@example.com',
      password: 'password123',
    });
    assert.equal(duplicate.status, 409);

    const invalid = await request(app).post('/api/auth/login').send({
      email: 'ava@example.com',
      password: 'wrong-password',
    });
    assert.equal(invalid.status, 401);

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.data.user.email, 'ava@example.com');
  });

  it('rejects an expired token', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const expired = jwt.sign(
      { id: String(new mongoose.Types.ObjectId()), exp: Math.floor(Date.now() / 1000) - 20 },
      process.env.JWT_SECRET
    );
    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
    assert.equal(response.status, 401);
  });

  it('uploads a text PDF and rejects an invalid file', async () => {
    const pdf = await makePdf(
      'Ava Shah Software Engineer. Experienced with JavaScript, React, and Node.js. Built web applications, collaborated with product teams, and studied computer science. Seeking a frontend engineer role.'
    );
    const uploaded = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', pdf, { filename: 'resume.pdf', contentType: 'application/pdf' });
    assert.equal(uploaded.status, 201);
    assert.ok(uploaded.body.data.resume.textLength > 80);
    resumeId = uploaded.body.data.resume.id;

    const invalid = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', Buffer.from('not a pdf'), { filename: 'notes.pdf', contentType: 'application/pdf' });
    assert.equal(invalid.status, 400);
  });

  it('analyzes a resume, stores history, and blocks other users', async () => {
    const job = 'Frontend engineer role requiring JavaScript, React, Node.js, and Kubernetes for deploying web applications to production clusters.';
    const empty = await request(app)
      .post('/api/analysis/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ resumeId, jobDescription: 'short' });
    assert.equal(empty.status, 400);

    const created = await request(app)
      .post('/api/analysis/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ resumeId, jobDescription: job });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.analysis.matchScore, 76);
    assert.equal(created.body.data.analysis.interviewQuestions.length, 3);
    analysisId = created.body.data.analysis._id;

    const bad = await request(app)
      .post('/api/analysis/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ resumeId, jobDescription: `${job} FORCE_BAD_JSON` });
    assert.equal(bad.status, 502);

    const other = await request(app).post('/api/auth/register').send({
      name: 'Sam Lee',
      email: 'sam@example.com',
      password: 'password123',
    });
    otherToken = other.body.data.token;
    const forbidden = await request(app)
      .get(`/api/analysis/${analysisId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    assert.equal(forbidden.status, 404);

    const history = await request(app).get('/api/analysis/history').set('Authorization', `Bearer ${token}`);
    assert.equal(history.body.data.analyses.length, 1);

    const stats = await request(app).get('/api/dashboard/stats').set('Authorization', `Bearer ${token}`);
    assert.equal(stats.body.data.totalAnalyses, 1);
    assert.equal(stats.body.data.averageMatchScore, 76);
  });

  it('generates an answer, chats, updates a profile, and deletes history', async () => {
    const answer = await request(app)
      .post('/api/interview/answer')
      .set('Authorization', `Bearer ${token}`)
      .send({ analysisId, question: 'How should I explain my React project?' });
    assert.equal(answer.status, 200);
    assert.match(answer.body.data.answer, /resume/i);

    const chat = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'What skills should I learn?',
        analysisId,
        history: [{ role: 'user', content: 'How can I improve my resume?' }],
      });
    assert.equal(chat.status, 200);
    assert.ok(chat.body.data.reply);

    const missingKey = await request(app).post('/api/chat').set('Authorization', `Bearer ${token}`).send({ message: '' });
    assert.equal(missingKey.status, 400);

    const profile = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ava S. Shah', currentPassword: 'password123', newPassword: 'newpassword123' });
    assert.equal(profile.status, 200);
    assert.equal(profile.body.data.user.name, 'Ava S. Shah');

    const removed = await request(app).delete(`/api/analysis/${analysisId}`).set('Authorization', `Bearer ${token}`);
    assert.equal(removed.status, 200);
    const gone = await request(app).get(`/api/analysis/${analysisId}`).set('Authorization', `Bearer ${token}`);
    assert.equal(gone.status, 404);
  });

  it('rejects a PDF without enough selectable text', async () => {
    const scanned = await makePdf('Scan');
    const response = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', scanned, { filename: 'scan.pdf', contentType: 'application/pdf' });
    assert.equal(response.status, 422);
    assert.match(response.body.message, /selectable text/i);
  });

  it('explains when the Gemini API key is missing', async () => {
    const gemini = await import('../services/geminiService.js');
    gemini.resetGeminiClientForTests();
    delete process.env.GEMINI_API_KEY;
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'How can I improve my resume?' });
    assert.equal(response.status, 503);
    assert.match(response.body.message, /GEMINI_API_KEY/);
    gemini.setGeminiClientForTests({
      models: {
        async generateContent() {
          return { text: 'Focus on skills the job asks for that are missing from your saved analysis.' };
        },
      },
    });
  });
});
