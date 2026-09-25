import mongoose from 'mongoose';

const { Schema } = mongoose;

const whatsAppSessionSchema = new Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    // Conversation state machine step, e.g. 'menu', 'scheme_district',
    // 'scheme_land_size', 'scheme_crop', 'pest_awaiting_photo'.
    currentStep: { type: String, default: 'menu' },
    // Freeform bag for data collected across a multi-step flow (e.g. the
    // scheme matcher asks district, then land size, then crop one at a time).
    context: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// Rolling 24-hour TTL on inactivity — an idle conversation resets to the
// main menu after a day rather than resuming a stale multi-step flow.
whatsAppSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export const WhatsAppSession = mongoose.model('WhatsAppSession', whatsAppSessionSchema);
