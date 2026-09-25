import crypto from 'node:crypto';
import { env } from '../config/env.js';

// Meta signs the exact raw request body bytes (before JSON parsing) with
// HMAC-SHA256 using the app secret, sent as `sha256=<hex digest>`.
export const verifyWhatsAppSignature = (rawBody, signatureHeader) => {
  if (!signatureHeader || !rawBody) return false;

  const expected = crypto
    .createHmac('sha256', env.whatsapp.appSecret)
    .update(rawBody)
    .digest('hex');
  const provided = signatureHeader.replace('sha256=', '');

  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
};
