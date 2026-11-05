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

    // Reconstruct the requested API endpoint if rewritten with query param or headers
    const urlObj = new URL(req.url, 'http://localhost');
    const endpointParam = urlObj.searchParams.get('endpoint');

    if (endpointParam) {
      urlObj.searchParams.delete('endpoint');
      const remainingSearch = urlObj.search;
      req.url = '/api/' + endpointParam.replace(/^\/+/, '') + remainingSearch;
    } else if (!req.url.startsWith('/api')) {
      const forwarded = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
      if (forwarded && forwarded.startsWith('/api')) {
        req.url = forwarded;
      } else {
        req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      }
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
