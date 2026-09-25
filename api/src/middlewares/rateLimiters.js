import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

const handler = (req, res) => {
  sendError(res, {
    statusCode: 429,
    code: 'RATE_LIMITED',
    message: 'Too many requests, please try again later',
  });
};

// Rate limiting is real infrastructure behavior we don't want to disable in
// production/dev, but it makes the automated test suite (many requests from
// one IP within seconds) flaky. Skip enforcement under NODE_ENV=test only.
const skip = () => env.isTest;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler,
});

export const pestDetectionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  skip,
  handler,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler,
});
