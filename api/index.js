import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';
import { assertRuntimeEnv } from '../backend/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

let isConnecting = false;

async function ensureConnected() {
  if (isConnecting) return;
  try {
    isConnecting = true;
    assertRuntimeEnv();
    await connectDB();
  } finally {
    isConnecting = false;
  }
}

export default async function handler(req, res) {
  try {
    await ensureConnected();

    // Preserve the original requested route when Vercel rewrites to /api
    const matchedPath = req.headers['x-matched-path'];
    if (matchedPath && matchedPath.startsWith('/api')) {
      const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      req.url = matchedPath + query;
    }

    return app(req, res);
  } catch (error) {
    console.error('[CareerCraft Serverless Error]:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Server initialization failed.',
    });
  }
}
