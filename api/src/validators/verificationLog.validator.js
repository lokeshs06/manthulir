import { z } from 'zod';

export const createVerificationLogSchema = {
  body: z.object({
    practiceType: z.string().min(1),
    description: z.string().max(1000).optional(),
  }),
};

export const flagVerificationLogSchema = {
  body: z.object({
    flagReason: z.string().min(1).max(500),
  }),
};

export const resolveFlagSchema = {
  body: z.object({
    resolutionNote: z.string().max(500).optional(),
  }),
};
