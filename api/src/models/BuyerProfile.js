import mongoose from 'mongoose';
import { TN_DISTRICTS } from '../config/constants.js';

const { Schema } = mongoose;

const buyerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    district: { type: String, enum: TN_DISTRICTS },
    businessType: { type: String },
    interestedCrops: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const BuyerProfile = mongoose.model('BuyerProfile', buyerProfileSchema);
