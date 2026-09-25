import mongoose from 'mongoose';
import { INQUIRY_STATUSES } from '../config/constants.js';

const { Schema } = mongoose;

const inquirySchema = new Schema(
  {
    produceId: { type: Schema.Types.ObjectId, ref: 'Produce', required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'BuyerProfile', required: true },
    // Denormalized from the produce listing at inquiry time so the farmer
    // side can be queried directly without populating through produce.
    farmerId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', default: null },
    clusterId: { type: Schema.Types.ObjectId, ref: 'Cluster', default: null },

    message: { type: String, required: true },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'pending' },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

inquirySchema.index({ farmerId: 1, status: 1 });
inquirySchema.index({ buyerId: 1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
