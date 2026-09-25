import { z } from 'zod';
import { TN_DISTRICTS } from '../config/constants.js';

export const createClusterSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(150),
    district: z.enum(TN_DISTRICTS),
  }),
};

export const rejectJoinRequestSchema = {
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
};

export const leaveClusterSchema = {
  body: z.object({
    // Required when the leaving member is the lead and other members remain.
    successorFarmerId: z.string().optional(),
  }),
};
