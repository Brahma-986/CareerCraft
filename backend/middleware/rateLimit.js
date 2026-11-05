import rateLimit from 'express-rate-limit';

function buildLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });
}

export const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT || 20),
  message: 'Too many authentication attempts. Please try again later.',
});

export const aiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AI_RATE_LIMIT || 30),
  message: 'Too many AI requests. Please wait a few minutes and try again.',
});

export { buildLimiter };
