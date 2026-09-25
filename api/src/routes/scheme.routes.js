import { Router } from 'express';
import { authenticate, authenticateOptional } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createSchemeSchema, updateSchemeSchema, matchSchemesQuerySchema } from '../validators/scheme.validator.js';
import {
  listSchemesHandler,
  getSchemeHandler,
  createSchemeHandler,
  updateSchemeHandler,
  deleteSchemeHandler,
  verifySchemeHandler,
  matchSchemesHandler,
} from '../controllers/scheme.controller.js';

const router = Router();

/**
 * @openapi
 * /schemes:
 *   get:
 *     tags: [Schemes]
 *     summary: List all schemes
 *     responses:
 *       200: { description: List of schemes }
 *   post:
 *     tags: [Schemes]
 *     summary: Create a scheme (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SchemeInput' }
 *     responses:
 *       201: { description: Scheme created, unverified }
 */
router.get('/', listSchemesHandler);
router.post('/', authenticate, requireRole('admin'), validate(createSchemeSchema), createSchemeHandler);

/**
 * @openapi
 * /schemes/match:
 *   get:
 *     tags: [Schemes]
 *     summary: Match schemes against a farmer's (or anonymous query's) criteria
 *     responses:
 *       200: { description: Matched, near-match, and excluded schemes }
 */
router.get('/match', authenticateOptional, validate(matchSchemesQuerySchema), matchSchemesHandler);

/**
 * @openapi
 * /schemes/{id}:
 *   get:
 *     tags: [Schemes]
 *     summary: Get a scheme by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Scheme }
 *   patch:
 *     tags: [Schemes]
 *     summary: Update a scheme (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SchemeInput' }
 *     responses:
 *       200: { description: Updated scheme (verification reset) }
 *   delete:
 *     tags: [Schemes]
 *     summary: Soft-delete a scheme (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Scheme deleted }
 */
router.get('/:id', getSchemeHandler);
router.patch('/:id', authenticate, requireRole('admin'), validate(updateSchemeSchema), updateSchemeHandler);
router.delete('/:id', authenticate, requireRole('admin'), deleteSchemeHandler);

/**
 * @openapi
 * /schemes/{id}/verify:
 *   post:
 *     tags: [Schemes]
 *     summary: Mark a scheme as verified (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Scheme verified }
 */
router.post('/:id/verify', authenticate, requireRole('admin'), verifySchemeHandler);

export default router;
