import mongoose from 'mongoose';
import { PRODUCE_UNITS, BADGE_LEVELS, TRANSITION_STATUSES } from '../config/constants.js';

const { Schema } = mongoose;

const produceSchema = new Schema(
  {
    // Exactly one of farmerId / clusterId is set — an individual listing
    // or a cluster-pooled one, never both.
    farmerId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', default: null },
    clusterId: { type: Schema.Types.ObjectId, ref: 'Cluster', default: null },

    cropName: { type: String, required: true },
    cropNameTa: { type: String },
    description: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: PRODUCE_UNITS, required: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },

    // Server-computed at create/update time from the owning farmer's (or,
    // for a cluster listing, the lowest-badged member's) actual profile
    // state — never accepted from the client, to prevent a farmer just
    // claiming a badge/certification they don't have.
    badge: { type: String, enum: BADGE_LEVELS, default: 'none' },
    transitionStatus: { type: String, enum: TRANSITION_STATUSES, default: 'not_started' },
    transitionMonth: { type: Number, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

produceSchema.index({ farmerId: 1, isActive: 1 });
produceSchema.index({ clusterId: 1, isActive: 1 });
produceSchema.index({ cropName: 1 });

export const Produce = mongoose.model('Produce', produceSchema);
