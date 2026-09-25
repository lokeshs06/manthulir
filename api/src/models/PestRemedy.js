import mongoose from 'mongoose';

const { Schema } = mongoose;

const organicTreatmentSchema = new Schema(
  {
    method: { type: String, required: true },
    methodTa: { type: String },
    ingredients: { type: [String], default: [] },
    preparationSteps: { type: [String], default: [] },
    preparationStepsTa: { type: [String], default: [] },
    applicationFrequency: { type: String },
    precautions: { type: String },
  },
  { _id: false },
);

const pestRemedySchema = new Schema(
  {
    // Must exactly match a label in ml-service/artifacts/labels.json so a
    // detection result can be resolved to its remedy.
    modelClassLabel: { type: String, required: true, unique: true },
    pestName: { type: String, required: true },
    pestNameTa: { type: String },
    scientificName: { type: String },
    problemType: { type: String, enum: ['insect', 'disease', 'deficiency'], required: true },
    affectedCrops: { type: [String], default: [] },
    symptoms: { type: String },
    symptomsTa: { type: String },
    lifecycle: { type: String },
    damageStage: { type: String },

    // Organic/non-chemical remedies only — this is the sole source of
    // remedy content served to farmers (Section 7.6).
    organicTreatments: { type: [organicTreatmentSchema], default: [] },
    preventiveMeasures: { type: [String], default: [] },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },

    sourceReferences: { type: [String], default: [] },
    // Remedy content must be reviewed by an agronomist/KVK expert before
    // being treated as authoritative — defaults to false until that happens.
    reviewedByExpert: { type: Boolean, default: false },
  },
  { timestamps: true },
);

pestRemedySchema.index({ problemType: 1 });
pestRemedySchema.index({ affectedCrops: 1 });

export const PestRemedy = mongoose.model('PestRemedy', pestRemedySchema);
