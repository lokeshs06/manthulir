import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { reviewCertificationSchema } from '../validators/admin.validator.js';
import {
  getStatsHandler,
  listFlaggedLogsHandler,
  resolveFlaggedLogHandler,
  listPendingCertificationsHandler,
  reviewCertificationHandler,
  getUnverifiedSchemesReportHandler,
  getPestFeedbackReportHandler,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Platform stats (farmers by district/status, detections per week, listings, clusters)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Platform stats }
 */
router.get('/stats', getStatsHandler);

/**
 * @openapi
 * /admin/flagged-logs:
 *   get:
 *     tags: [Admin]
 *     summary: List flagged verification logs
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Flagged logs }
 */
router.get('/flagged-logs', listFlaggedLogsHandler);
router.post('/flagged-logs/:id/resolve', resolveFlaggedLogHandler);

/**
 * @openapi
 * /admin/certifications/pending:
 *   get:
 *     tags: [Admin]
 *     summary: List pending certification submissions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Pending certifications }
 */
router.get('/certifications/pending', listPendingCertificationsHandler);
router.post('/certifications/:farmerId/review', validate(reviewCertificationSchema), reviewCertificationHandler);

/**
 * @openapi
 * /admin/reports/unverified-schemes:
 *   get:
 *     tags: [Admin]
 *     summary: Schemes never verified, or stale (verified >12 months ago)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Unverified/stale schemes }
 */
router.get('/reports/unverified-schemes', getUnverifiedSchemesReportHandler);

/**
 * @openapi
 * /admin/reports/pest-feedback:
 *   get:
 *     tags: [Admin]
 *     summary: Detections marked incorrect by farmers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Incorrect-feedback detections }
 */
router.get('/reports/pest-feedback', getPestFeedbackReportHandler);

export default router;
