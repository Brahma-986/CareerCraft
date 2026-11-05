const REQUIRED_IN_PRODUCTION = ['MONGO_URI', 'JWT_SECRET'];

export function assertRuntimeEnv() {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters in production.');
  }
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return secret;
}

export function getMaxUploadBytes() {
  const mb = Number(process.env.MAX_FILE_SIZE_MB || 5);
  if (!Number.isFinite(mb) || mb <= 0 || mb > 15) return 5 * 1024 * 1024;
  return Math.floor(mb * 1024 * 1024);
}
