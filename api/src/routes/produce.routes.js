import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProduceSchema, updateProduceSchema } from '../validators/produce.validator.js';
import {
  createProduceHandler,
  updateProduceHandler,
  deactivateProduceHandler,
  listActiveProduceHandler,
  listMyProduceHandler,
} from '../controllers/produce.controller.js';

const router = Router();

/**
 * @openapi
 * /produce:
 *   get:
 *     tags: [Produce]
 *     summary: List active produce listings (public marketplace)
 *     responses:
 *       200: { description: List of listings }
 *   post:
 *     tags: [Produce]
 *     summary: Create a produce listing
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProduceInput' }
 *     responses:
 *       201: { description: Listing created }
 */
router.get('/', listActiveProduceHandler);
router.post('/', authenticate, requireRole('farmer'), validate(createProduceSchema), createProduceHandler);

/**
 * @openapi
 * /produce/mine:
 *   get:
 *     tags: [Produce]
 *     summary: List my own (and my clusters') produce listings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: My listings }
 */
router.get('/mine', authenticate, requireRole('farmer'), listMyProduceHandler);

/**
 * @openapi
 * /produce/{id}:
 *   patch:
 *     tags: [Produce]
 *     summary: Update a produce listing
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProduceInput' }
 *     responses:
 *       200: { description: Updated listing }
 *   delete:
 *     tags: [Produce]
 *     summary: Deactivate a produce listing
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Listing deactivated }
 */
router.patch('/:id', authenticate, requireRole('farmer'), validate(updateProduceSchema), updateProduceHandler);
router.delete('/:id', authenticate, requireRole('farmer'), deactivateProduceHandler);

export default router;
