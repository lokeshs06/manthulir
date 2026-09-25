import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const signAccessToken = (userId, role) =>
  jwt.sign({ sub: userId, role }, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });

export const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

// Refresh tokens are stored hashed (never in plaintext) so a database
// dump alone can't be replayed as a valid refresh token.
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
