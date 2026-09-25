import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().regex(/^\d{10}$/, 'Phone must be a 10-digit number'),
    password: z.string().min(8).max(72),
    role: z.enum(['farmer', 'buyer']).default('farmer'),
  }),
};

export const loginSchema = {
  body: z.object({
    phone: z.string().trim().regex(/^\d{10}$/, 'Phone must be a 10-digit number'),
    password: z.string().min(1),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};
