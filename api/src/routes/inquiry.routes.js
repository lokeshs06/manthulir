import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createInquiryHandler,
  listMyInquiriesAsBuyerHandler,
  listInquiriesForMyProduceHandler,
  acceptInquiryHandler,
  rejectInquiryHandler,
  getRevealedContactHandler,
} from '../controllers/inquiry.controller.js';

const router = Router();

const createInquirySchema = {
  body: z.object({
    produceId: z.string().min(1),
    message: z.string().min(1).max(1000),
  }),
};

/**
 * @openapi
 * /inquiries:
 *   post:
 *     tags: [Inquiries]
 *     summary: Send an inquiry about a produce listing (buyer)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Inquiry sent }
 *   get:
 *     tags: [Inquiries]
 *     summary: List my inquiries as a buyer
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of inquiries }
 */
router.post('/', authenticate, requireRole('buyer'), validate(createInquirySchema), createInquiryHandler);
router.get('/', authenticate, requireRole('buyer'), listMyInquiriesAsBuyerHandler);

/**
 * @openapi
 * /inquiries/mine-as-farmer:
 *   get:
 *     tags: [Inquiries]
 *     summary: List inquiries on my (or my cluster's) produce
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of inquiries }
 */
router.get('/mine-as-farmer', authenticate, requireRole('farmer'), listInquiriesForMyProduceHandler);

/**
 * @openapi
 * /inquiries/{id}/accept:
 *   post:
 *     tags: [Inquiries]
 *     summary: Accept an inquiry (farmer) — reveals phone contact to the buyer
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Inquiry accepted }
 */
router.post('/:id/accept', authenticate, requireRole('farmer'), acceptInquiryHandler);
router.post('/:id/reject', authenticate, requireRole('farmer'), rejectInquiryHandler);

/**
 * @openapi
 * /inquiries/{id}/contact:
 *   get:
 *     tags: [Inquiries]
 *     summary: Get the farmer's revealed contact (buyer, only once accepted)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Revealed contact }
 */
router.get('/:id/contact', authenticate, requireRole('buyer'), getRevealedContactHandler);

export default router;
