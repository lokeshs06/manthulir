import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload, uploadSingleFlexible } from '../middlewares/upload.middleware.js';
import { pestDetectionLimiter } from '../middlewares/rateLimiters.js';
import { detectPestSchema, pestFeedbackSchema, createPestRemedySchema, updatePestRemedySchema } from '../validators/pest.validator.js';
import {
  detectPestHandler,
  listMyDetectionsHandler,
  submitFeedbackHandler,
  listRemediesHandler,
  getRemedyHandler,
  createRemedyHandler,
  updateRemedyHandler,
  deleteRemedyHandler,
} from '../controllers/pest.controller.js';

const router = Router();

/**
 * @openapi
 * /pests/detect:
 *   post:
 *     tags: [Pest Detection]
 *     summary: Detect a pest/disease from a crop photo
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               consentForTraining: { type: boolean }
 *     responses:
 *       201: { description: Detection result with remedies }
 */
router.post(
  '/detect',
  authenticate,
  requireRole('farmer'),
  pestDetectionLimiter,
  uploadSingleFlexible,
  validate(detectPestSchema),
  detectPestHandler,
);

/**
 * @openapi
 * /pests/detections:
 *   get:
 *     tags: [Pest Detection]
 *     summary: List my past detections
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of detections }
 */
router.get('/detections', authenticate, requireRole('farmer'), listMyDetectionsHandler);

/**
 * @openapi
 * /pests/detections/{id}/feedback:
 *   post:
 *     tags: [Pest Detection]
 *     summary: Submit feedback on a detection's accuracy
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Feedback recorded }
 */
router.post(
  '/detections/:id/feedback',
  authenticate,
  requireRole('farmer'),
  validate(pestFeedbackSchema),
  submitFeedbackHandler,
);

/**
 * @openapi
 * /pests/remedies:
 *   get:
 *     tags: [Pest Remedies]
 *     summary: List all pest/disease remedies
 *     responses:
 *       200: { description: List of remedies }
 *   post:
 *     tags: [Pest Remedies]
 *     summary: Create a pest/disease remedy (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PestRemedyInput' }
 *     responses:
 *       201: { description: Remedy created }
 */
router.get('/remedies', listRemediesHandler);
router.post('/remedies', authenticate, requireRole('admin'), validate(createPestRemedySchema), createRemedyHandler);

/**
 * @openapi
 * /pests/remedies/{id}:
 *   get:
 *     tags: [Pest Remedies]
 *     summary: Get a remedy by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Remedy }
 *   patch:
 *     tags: [Pest Remedies]
 *     summary: Update a remedy (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PestRemedyInput' }
 *     responses:
 *       200: { description: Updated remedy }
 *   delete:
 *     tags: [Pest Remedies]
 *     summary: Delete a remedy (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Remedy deleted }
 */
router.get('/remedies/:id', getRemedyHandler);
router.patch('/remedies/:id', authenticate, requireRole('admin'), validate(updatePestRemedySchema), updateRemedyHandler);
router.delete('/remedies/:id', authenticate, requireRole('admin'), deleteRemedyHandler);

export default router;
