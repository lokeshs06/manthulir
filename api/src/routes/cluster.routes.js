import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createClusterSchema, rejectJoinRequestSchema, leaveClusterSchema } from '../validators/cluster.validator.js';
import {
  createClusterHandler,
  listClustersHandler,
  getClusterHandler,
  requestToJoinHandler,
  approveJoinRequestHandler,
  rejectJoinRequestHandler,
  leaveClusterHandler,
} from '../controllers/cluster.controller.js';

const router = Router();

/**
 * @openapi
 * /clusters:
 *   get:
 *     tags: [Clusters]
 *     summary: List clusters (optionally by district)
 *     responses:
 *       200: { description: List of clusters }
 *   post:
 *     tags: [Clusters]
 *     summary: Create a cluster (becomes its lead)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClusterInput' }
 *     responses:
 *       201: { description: Cluster created }
 */
router.get('/', listClustersHandler);
router.post('/', authenticate, requireRole('farmer'), validate(createClusterSchema), createClusterHandler);

/**
 * @openapi
 * /clusters/{id}:
 *   get:
 *     tags: [Clusters]
 *     summary: Get a cluster by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cluster }
 */
router.get('/:id', getClusterHandler);

/**
 * @openapi
 * /clusters/{id}/join:
 *   post:
 *     tags: [Clusters]
 *     summary: Request to join a cluster
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Join request submitted }
 */
router.post('/:id/join', authenticate, requireRole('farmer'), requestToJoinHandler);

/**
 * @openapi
 * /clusters/{id}/join-requests/{farmerId}/approve:
 *   post:
 *     tags: [Clusters]
 *     summary: Approve a join request (lead only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Member added }
 */
router.post('/:id/join-requests/:farmerId/approve', authenticate, requireRole('farmer'), approveJoinRequestHandler);
router.post(
  '/:id/join-requests/:farmerId/reject',
  authenticate,
  requireRole('farmer'),
  validate(rejectJoinRequestSchema),
  rejectJoinRequestHandler,
);

/**
 * @openapi
 * /clusters/{id}/leave:
 *   post:
 *     tags: [Clusters]
 *     summary: Leave a cluster (lead must name a successor if others remain)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Left the cluster }
 */
router.post('/:id/leave', authenticate, requireRole('farmer'), validate(leaveClusterSchema), leaveClusterHandler);

export default router;
