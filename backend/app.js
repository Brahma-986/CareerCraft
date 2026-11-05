import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        /\.vercel\.app$/i.test(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'CareerCraft API is running.',
  });
});

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    message: 'CareerCraft API is running.',
    data: { database: connected ? 'connected' : 'disconnected' },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
