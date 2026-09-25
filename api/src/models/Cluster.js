import mongoose from 'mongoose';
import { TN_DISTRICTS } from '../config/constants.js';

const { Schema } = mongoose;

const joinRequestSchema = new Schema(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    requestedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const clusterSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, enum: TN_DISTRICTS, required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    memberIds: { type: [{ type: Schema.Types.ObjectId, ref: 'FarmerProfile' }], default: [] },
    // Kept in sync with memberIds.length by cluster.service.js on every
    // join/approve/leave — cheap to read without populating the array.
    memberCount: { type: Number, default: 0 },
    pendingJoinRequests: { type: [joinRequestSchema], default: [] },
    totalLandSizeAcres: { type: Number, default: 0 },
  },
  { timestamps: true },
);

clusterSchema.index({ district: 1 });

export const Cluster = mongoose.model('Cluster', clusterSchema);
