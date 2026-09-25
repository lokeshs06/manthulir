import mongoose from 'mongoose';

const { Schema } = mongoose;

const peerVerificationSchema = new Schema(
  {
    verifierId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    verifiedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const verificationLogSchema = new Schema(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    practiceType: { type: String, required: true },
    description: { type: String },
    // Cloudinary transform strips EXIF/GPS metadata before storage.
    photoUrl: { type: String, required: true },
    photoPublicId: { type: String, required: true },

    peerVerifications: { type: [peerVerificationSchema], default: [] },

    flagged: { type: Boolean, default: false },
    flagReason: { type: String },
    flagResolvedAt: { type: Date },
    flagResolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

verificationLogSchema.index({ farmerId: 1, createdAt: -1 });
verificationLogSchema.index({ flagged: 1 });

export const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);
