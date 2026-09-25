import { z } from 'zod';
import { TN_DISTRICTS } from '../config/constants.js';

export const updateFarmerProfileSchema = {
  body: z.object({
    district: z.enum(TN_DISTRICTS).optional(),
    landSizeAcres: z.number().min(0).optional(),
    crops: z.array(z.string()).optional(),
    bio: z.string().max(1000).optional(),
  }),
};
