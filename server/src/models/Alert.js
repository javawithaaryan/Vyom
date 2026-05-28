import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['fraud', 'scam', 'system'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    riskLevel: { type: String, default: 'medium' },
    riskScore: { type: Number, min: 0, max: 100 },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

alertSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
