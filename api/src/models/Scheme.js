import mongoose from 'mongoose';
import { TN_DISTRICTS } from '../config/constants.js';

const { Schema } = mongoose;

// Eligibility rules used by schemeMatcher.service.js. An empty array on any
// of the array fields means "no restriction" (matches every farmer), not
// "matches nobody" — this is a deliberate convention, not an oversight.
const eligibilitySchema = new Schema(
  {
    applicableDistricts: { type: [String], enum: TN_DISTRICTS, default: [] },
    applicableCrops: { type: [String], default: [] },
    farmerCategories: { type: [String], enum: ['marginal', 'small', 'medium'], default: [] },
    minLandSizeAcres: { type: Number, default: null },
    maxLandSizeAcres: { type: Number, default: null },
    // null/undefined = not a requirement either way; true = must be
    // certified; false = must NOT yet be certified (e.g. transition-only support).
    requiresCertification: { type: Boolean, default: null },
  },
  { _id: false },
);

const schemeSchema = new Schema(
  {
    name: { type: String, required: true },
    nameTa: { type: String },
    description: { type: String, required: true },
    descriptionTa: { type: String },
    department: { type: String, required: true },
    category: { type: String },

    // Deliberately free text, not a Number — real scheme amounts must never
    // be invented. Seed data uses explicit "PLACEHOLDER: ..." markers here
    // until verified against an official source.
    benefitsSummary: { type: String },
    benefitsSummaryTa: { type: String },
    applicationProcess: { type: String },
    applicationProcessTa: { type: String },
    // Same placeholder convention — never a fabricated/guessed URL.
    officialUrl: { type: String },

    eligibility: { type: eligibilitySchema, default: () => ({}) },

    // Months since a farmer's transitionStartDate during which this scheme
    // is relevant, for linking into the generated transition timeline.
    // Both required together — a scheme without an explicit window is not
    // linked to any timeline milestone (see timeline.service.js).
    applicableFromMonth: { type: Number, default: null },
    applicableToMonth: { type: Number, default: null },

    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

schemeSchema.index({ verified: 1, isDeleted: 1 });
schemeSchema.index({ 'eligibility.applicableDistricts': 1 });
schemeSchema.index({ 'eligibility.applicableCrops': 1 });

export const Scheme = mongoose.model('Scheme', schemeSchema);
