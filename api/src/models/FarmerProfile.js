import mongoose from 'mongoose';
import { TN_DISTRICTS, TRANSITION_STATUSES, BADGE_LEVELS, CLUSTER_MAX_PER_FARMER } from '../config/constants.js';
import { geoPointSchema } from './shared/geoPoint.schema.js';

const { Schema } = mongoose;

const certificationSchema = new Schema(
  {
    status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    documentUrl: { type: String },
    documentPublicId: { type: String },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  { _id: false },
);

const milestoneSchema = new Schema(
  {
    month: { type: Number, required: true },
    title: { type: String, required: true },
    titleTa: { type: String },
    description: { type: String },
    descriptionTa: { type: String },
    status: { type: String, enum: ['upcoming', 'current', 'completed'], default: 'upcoming' },
    // Recomputed daily by the milestone-updater cron — a scheme newly
    // verified after this milestone was first generated still gets linked.
    linkedSchemeIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Scheme' }], default: [] },
  },
  { _id: false },
);

const farmerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Not required at creation — a farmer's profile is created bare at
    // registration and completed afterward via the profile-update endpoint.
    district: { type: String, enum: TN_DISTRICTS, default: null },
    location: { type: geoPointSchema },
    landSizeAcres: { type: Number, min: 0 },
    crops: { type: [String], default: [] },

    transitionStatus: { type: String, enum: TRANSITION_STATUSES, default: 'not_started' },
    // Set once, the first time a farmer records a transition-related
    // verification log — used to compute "months since transition start"
    // for badges, scheme eligibility, and the timeline generator.
    transitionStartDate: { type: Date, default: null },

    certification: { type: certificationSchema, default: () => ({}) },

    // Cached, recomputed by badge.service.js whenever a verification log
    // or certification changes — avoids recalculating on every read.
    badge: { type: String, enum: BADGE_LEVELS, default: 'none' },
    badgeUpdatedAt: { type: Date },

    clusterIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Cluster' }],
      default: [],
      validate: {
        validator: (arr) => arr.length <= CLUSTER_MAX_PER_FARMER,
        message: `A farmer may belong to at most ${CLUSTER_MAX_PER_FARMER} clusters`,
      },
    },

    savedSchemeIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Scheme' }], default: [] },
    appliedSchemeIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Scheme' }], default: [] },

    milestones: { type: [milestoneSchema], default: [] },

    bio: { type: String },
    photoUrl: { type: String },
  },
  { timestamps: true },
);

farmerProfileSchema.index({ district: 1 });
farmerProfileSchema.index({ transitionStatus: 1 });
farmerProfileSchema.index({ badge: 1 });

export const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);
