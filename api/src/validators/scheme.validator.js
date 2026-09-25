import { z } from 'zod';
import { TN_DISTRICTS } from '../config/constants.js';

const eligibilitySchema = z.object({
  applicableDistricts: z.array(z.enum(TN_DISTRICTS)).default([]),
  applicableCrops: z.array(z.string()).default([]),
  farmerCategories: z.array(z.enum(['marginal', 'small', 'medium'])).default([]),
  minLandSizeAcres: z.number().min(0).nullable().default(null),
  maxLandSizeAcres: z.number().min(0).nullable().default(null),
  requiresCertification: z.boolean().nullable().default(null),
});

export const createSchemeSchema = {
  body: z.object({
    name: z.string().min(2),
    nameTa: z.string().optional(),
    description: z.string().min(1),
    descriptionTa: z.string().optional(),
    department: z.string().min(1),
    category: z.string().optional(),
    benefitsSummary: z.string().optional(),
    benefitsSummaryTa: z.string().optional(),
    applicationProcess: z.string().optional(),
    applicationProcessTa: z.string().optional(),
    officialUrl: z.string().optional(),
    eligibility: eligibilitySchema.optional(),
    applicableFromMonth: z.number().int().min(0).nullable().optional(),
    applicableToMonth: z.number().int().min(0).nullable().optional(),
  }),
};

export const updateSchemeSchema = {
  body: createSchemeSchema.body.partial(),
};

export const matchSchemesQuerySchema = {
  query: z.object({
    district: z.enum(TN_DISTRICTS).optional(),
    landSizeAcres: z.coerce.number().min(0).optional(),
    crops: z
      .union([z.string(), z.array(z.string())])
      .transform((v) => (Array.isArray(v) ? v : v ? [v] : []))
      .optional(),
    lang: z.enum(['ta', 'en', 'all']).optional(),
  }),
};
