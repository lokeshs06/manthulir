import { z } from 'zod';
import { TN_DISTRICTS } from '../config/constants.js';

export const updateBuyerProfileSchema = {
  body: z.object({
    businessName: z.string().trim().min(2).max(150).optional(),
    district: z.enum(TN_DISTRICTS).optional(),
    businessType: z.string().max(100).optional(),
    interestedCrops: z.array(z.string()).optional(),
  }),
};
