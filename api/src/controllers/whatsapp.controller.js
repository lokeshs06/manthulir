import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyWhatsAppSignature } from '../utils/whatsappSignature.js';
import { handleIncomingMessage } from '../services/whatsapp.service.js';
import { logger } from '../utils/logger.js';

export const verifyWebhookHandler = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

// Processed fully (not "fast-acked" before finishing async work) — a
// deliberate correctness/testability tradeoff over the more common
// respond-200-immediately pattern.
export const receiveWebhookHandler = asyncHandler(async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!verifyWhatsAppSignature(req.rawBody, signature)) {
    return res.sendStatus(401);
  }

  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (message) {
    try {
      await handleIncomingMessage(message.from, message);
    } catch (err) {
      logger.error({ err }, 'Failed to process WhatsApp message');
    }
  }

  res.sendStatus(200);
});
