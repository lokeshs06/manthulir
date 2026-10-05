import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload, uploadSingleFlexible } from '../middlewares/upload.middleware.js';
import { updateFarmerProfileSchema } from '../validators/farmer.validator.js';
import {
  getMyProfileHandler,
  updateMyProfileHandler,
  getPublicProfileHandler,
  getMyTimelineHandler,
  submitCertificationHandler,
  saveSchemeHandler,
  unsaveSchemeHandler,
  markSchemeAppliedHandler,
  listSavedSchemesHandler,
  listAppliedSchemesHandler,
} from '../controllers/farmer.controller.js';

const router = Router();

/**
 * @openapi
 * /farmers/me:
 *   get:
 *     tags: [Farmers]
 *     summary: Get my farmer profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Farmer profile }
 *   patch:
 *     tags: [Farmers]
 *     summary: Update my farmer profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated profile }
 */
router.get('/me', authenticate, requireRole('farmer'), getMyProfileHandler);
router.patch('/me', authenticate, requireRole('farmer'), validate(updateFarmerProfileSchema), updateMyProfileHandler);

/**
 * @openapi
 * /farmers/me/timeline:
 *   get:
 *     tags: [Farmers]
 *     summary: Get my transition timeline
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Timeline milestones }
 */
router.get('/me/timeline', authenticate, requireRole('farmer'), getMyTimelineHandler);

/**
 * @openapi
 * /farmers/me/certification:
 *   post:
 *     tags: [Farmers]
 *     summary: Submit an organic certification document for review
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: Certification submitted, pending review }
 */
router.post('/me/certification', authenticate, requireRole('farmer'), uploadSingleFlexible, submitCertificationHandler);

/**
 * @openapi
 * /farmers/{id}/public:
 *   get:
 *     tags: [Farmers]
 *     summary: Get a farmer's public trust summary
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Public farmer summary }
 */
router.get('/:id/public', getPublicProfileHandler);

router.post('/me/schemes/:schemeId/save', authenticate, requireRole('farmer'), saveSchemeHandler);
router.delete('/me/schemes/:schemeId/save', authenticate, requireRole('farmer'), unsaveSchemeHandler);
router.post('/me/schemes/:schemeId/apply', authenticate, requireRole('farmer'), markSchemeAppliedHandler);
router.get('/me/schemes/saved', authenticate, requireRole('farmer'), listSavedSchemesHandler);
router.get('/me/schemes/applied', authenticate, requireRole('farmer'), listAppliedSchemesHandler);

export default router;
