import { z } from 'zod';
import { PRODUCE_UNITS } from '../config/constants.js';

export const createProduceSchema = {
  body: z.object({
    cropName: z.string().min(1),
    cropNameTa: z.string().optional(),
    description: z.string().max(1000).optional(),
    quantity: z.number().positive(),
    unit: z.enum(PRODUCE_UNITS),
    pricePerUnit: z.number().positive(),
    images: z.array(z.string()).optional(),
    // Exactly one required — enforced in produce.service.js, since it
    // depends on the authenticated user's role, not just shape.
    clusterId: z.string().optional(),
  }),
};

export const updateProduceSchema = {
  body: createProduceSchema.body.partial(),
};
