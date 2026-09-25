import { z } from 'zod';
import { PEST_FEEDBACK_TYPES } from '../config/constants.js';

export const detectPestSchema = {
  body: z.object({
    consentForTraining: z.coerce.boolean().default(false),
  }),
};

export const pestFeedbackSchema = {
  body: z.object({
    farmerFeedback: z.enum(PEST_FEEDBACK_TYPES),
    feedbackNote: z.string().max(500).optional(),
  }),
};

export const createPestRemedySchema = {
  body: z.object({
    modelClassLabel: z.string().min(1),
    pestName: z.string().min(1),
    pestNameTa: z.string().optional(),
    scientificName: z.string().optional(),
    problemType: z.enum(['insect', 'disease', 'deficiency']),
    affectedCrops: z.array(z.string()).default([]),
    symptoms: z.string().optional(),
    symptomsTa: z.string().optional(),
    lifecycle: z.string().optional(),
    damageStage: z.string().optional(),
    organicTreatments: z
      .array(
        z.object({
          method: z.string().min(1),
          methodTa: z.string().optional(),
          ingredients: z.array(z.string()).default([]),
          preparationSteps: z.array(z.string()).default([]),
          preparationStepsTa: z.array(z.string()).default([]),
          applicationFrequency: z.string().optional(),
          precautions: z.string().optional(),
        }),
      )
      .default([]),
    preventiveMeasures: z.array(z.string()).default([]),
    severity: z.enum(['low', 'medium', 'high']).default('medium'),
    sourceReferences: z.array(z.string()).default([]),
  }),
};

export const updatePestRemedySchema = {
  body: createPestRemedySchema.body.partial(),
};
