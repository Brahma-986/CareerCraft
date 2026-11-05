// Polyfill browser globals required by pdfjs-dist in headless serverless environments
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {};
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {};
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D {};
}

import dotenv from 'dotenv';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import app from '../backend/app.js';

dotenv.config();

export default app;
