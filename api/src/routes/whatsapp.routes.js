import { Router } from 'express';
import { verifyWebhookHandler, receiveWebhookHandler } from '../controllers/whatsapp.controller.js';

const router = Router();

/**
 * @openapi
 * /whatsapp/webhook:
 *   get:
 *     tags: [WhatsApp]
 *     summary: Meta webhook verification handshake
 *     responses:
 *       200: { description: Challenge echoed back }
 *       403: { description: Verify token mismatch }
 *   post:
 *     tags: [WhatsApp]
 *     summary: Receive inbound WhatsApp messages
 *     responses:
 *       200: { description: Processed }
 *       401: { description: Invalid signature }
 */
router.get('/webhook', verifyWebhookHandler);
router.post('/webhook', receiveWebhookHandler);

export default router;
