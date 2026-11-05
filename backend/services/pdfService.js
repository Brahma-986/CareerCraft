import fs from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/AppError.js';

const MIN_LETTERS = 80;

export function assertPdfSignature(buffer) {
  if (!buffer || buffer.length < 5) {
    throw new AppError('The uploaded file is not a valid PDF.', 400);
  }
  const signature = buffer.subarray(0, 5).toString('utf8');
  if (signature !== '%PDF-') {
    throw new AppError('The uploaded file is not a valid PDF.', 400);
  }
}

export function assertExtractedText(text) {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  const letters = (compact.match(/[A-Za-z]/g) || []).length;
  if (letters < MIN_LETTERS) {
    throw new AppError(
      'This PDF does not contain enough selectable text. Scanned or image-only resumes are not supported.',
      422
    );
  }
  return compact;
}

export async function extractPdfText(filePath) {
  const buffer = await fs.readFile(filePath);
  assertPdfSignature(buffer);

  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = assertExtractedText(result?.text);
    return {
      text: text.slice(0, 50000),
      textLength: text.length,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('The PDF could not be read. Please upload a text-based PDF resume.', 422);
  } finally {
    await parser.destroy().catch(() => {});
  }
}
