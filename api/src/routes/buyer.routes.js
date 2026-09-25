import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateBuyerProfileSchema } from '../validators/buyer.validator.js';
import { getMyProfileHandler, updateMyProfileHandler } from '../controllers/buyer.controller.js';

const router = Router();

/**
 * @openapi
 * /buyers/me:
 *   get:
 *     tags: [Buyers]
 *     summary: Get my buyer profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Buyer profile }
 *   patch:
 *     tags: [Buyers]
 *     summary: Update my buyer profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated profile }
 */
router.get('/me', authenticate, requireRole('buyer'), getMyProfileHandler);
router.patch('/me', authenticate, requireRole('buyer'), validate(updateBuyerProfileSchema), updateMyProfileHandler);

export default router;
