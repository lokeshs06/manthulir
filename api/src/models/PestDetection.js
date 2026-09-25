import mongoose from 'mongoose';
import { PEST_DETECTION_RESULT_TYPES, PEST_FEEDBACK_TYPES } from '../config/constants.js';

const { Schema } = mongoose;

const predictionSchema = new Schema(
  {
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
  },
  { _id: false },
);

const pestDetectionSchema = new Schema(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },

    predictions: { type: [predictionSchema], default: [] },
    topLabel: { type: String },
    topConfidence: { type: Number },
    resultType: { type: String, enum: PEST_DETECTION_RESULT_TYPES, required: true },
    remedyIds: { type: [{ type: Schema.Types.ObjectId, ref: 'PestRemedy' }], default: [] },
    modelVersion: { type: String },

    // Whether the farmer consented to this image being used for future
    // model training — never assumed true by default.
    consentForTraining: { type: Boolean, default: false },

    farmerFeedback: { type: String, enum: PEST_FEEDBACK_TYPES, default: null },
    feedbackNote: { type: String },
  },
  { timestamps: true },
);

pestDetectionSchema.index({ farmerId: 1, createdAt: -1 });
pestDetectionSchema.index({ farmerFeedback: 1 });

export const PestDetection = mongoose.model('PestDetection', pestDetectionSchema);
