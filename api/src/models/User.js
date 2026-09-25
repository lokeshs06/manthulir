import mongoose from 'mongoose';
import { USER_ROLES } from '../config/constants.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true, default: 'farmer' },
    // Set only once a WhatsApp inbound message from this number has been
    // matched to this account, for the optional WhatsApp channel.
    whatsappPhone: { type: String },
    // Hash of the current valid refresh token — rotated on every refresh,
    // never stored in plaintext.
    refreshTokenHash: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

export const User = mongoose.model('User', userSchema);
