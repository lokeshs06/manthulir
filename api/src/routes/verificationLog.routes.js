import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload, uploadSingleFlexible } from '../middlewares/upload.middleware.js';
import {
  createVerificationLogSchema,
  flagVerificationLogSchema,
} from '../validators/verificationLog.validator.js';
import {
  createLogHandler,
  listMyLogsHandler,
  peerVerifyHandler,
  flagLogHandler,
} from '../controllers/verificationLog.controller.js';

const router = Router();

/**
 * @openapi
 * /verification-logs:
 *   post:
 *     tags: [Verification]
 *     summary: Create a verification log with a photo
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               practiceType: { type: string }
 *               description: { type: string }
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: Log created }
 *   get:
 *     tags: [Verification]
 *     summary: List my verification logs
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of logs }
 */
router.post(
  '/',
  authenticate,
  requireRole('farmer'),
  uploadSingleFlexible,
  validate(createVerificationLogSchema),
  createLogHandler,
);
router.get('/', authenticate, requireRole('farmer'), listMyLogsHandler);

/**
 * @openapi
 * /verification-logs/{id}/peer-verify:
 *   post:
 *     tags: [Verification]
 *     summary: Peer-verify a cluster member's log (must be fresh and share a cluster)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Log peer-verified }
 */
router.post('/:id/peer-verify', authenticate, requireRole('farmer'), peerVerifyHandler);

/**
 * @openapi
 * /verification-logs/{id}/flag:
 *   post:
 *     tags: [Verification]
 *     summary: Flag a log for review
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Log flagged }
 */
router.post('/:id/flag', authenticate, validate(flagVerificationLogSchema), flagLogHandler);

export default router;
