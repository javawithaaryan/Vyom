import mongoose from 'mongoose';

const scamMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'Message too long'],
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ['safe', 'suspicious', 'likely_scam', 'confirmed_scam'],
      default: 'safe',
    },
    isScam: {
      type: Boolean,
      default: false,
    },
    signals: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      enum: [
        'phishing',
        'financial_fraud',
        'identity_theft',
        'urgency_manipulation',
        'prize_scam',
        'impersonation',
        'safe',
      ],
      default: ['safe'],
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    breakdown: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

scamMessageSchema.index({ userId: 1, createdAt: -1 });
scamMessageSchema.index({ riskLevel: 1 });

export default mongoose.model('ScamMessage', scamMessageSchema);
