import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { getMaxUploadBytes } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'careercraft_uploads')
  : path.resolve(__dirname, '../uploads/tmp');

try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // directory exists or created dynamically
}

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename(_req, _file, callback) {
    callback(null, `${crypto.randomBytes(16).toString('hex')}.pdf`);
  },
});

function fileFilter(_req, file, callback) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  if (file.mimetype !== 'application/pdf' || extension !== '.pdf') {
    const error = new Error('Only PDF files are allowed.');
    error.statusCode = 400;
    callback(error);
    return;
  }
  callback(null, true);
}

export const uploadResume = multer({
  storage,
  limits: { fileSize: getMaxUploadBytes(), files: 1 },
  fileFilter,
});

export async function removeUploadedFile(filePath) {
  if (!filePath) return;
  await fs.promises.unlink(filePath).catch(() => {});
}
