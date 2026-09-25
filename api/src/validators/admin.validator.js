import { z } from 'zod';

export const reviewCertificationSchema = {
  body: z.object({
    approve: z.boolean(),
    rejectionReason: z.string().max(500).optional(),
  }),
};

export const statsQuerySchema = {
  query: z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
  }),
};
