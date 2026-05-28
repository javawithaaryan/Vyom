import mongoose from 'mongoose';

const escalationStepSchema = new mongoose.Schema(
  {
    time: String,
    event: String,
    riskAfter: Number,
  },
  { _id: false }
);

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
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskLevel: {
      type: String,
      enum: ['safe', 'suspicious', 'likely_scam', 'confirmed_scam'],
      default: 'safe',
    },
    isScam: { type: Boolean, default: false },
    signals: { type: [String], default: [] },
    signalDetails: {
      type: [
        {
          id: String,
          label: String,
          weight: Number,
          riskAfter: Number,
        },
      ],
      default: [],
    },
    escalationTimeline: { type: [escalationStepSchema], default: [] },
    recommendation: { type: String, default: '' },
    humanSummary: { type: String, default: '' },
    highlightedPhrases: { type: [String], default: [] },
    categories: {
      type: [String],
      default: ['safe'],
    },
    aiConfidence: { type: Number, min: 0, max: 1, default: 0 },
    breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

scamMessageSchema.index({ userId: 1, createdAt: -1 });
scamMessageSchema.index({ riskLevel: 1 });

export default mongoose.model('ScamMessage', scamMessageSchema);
