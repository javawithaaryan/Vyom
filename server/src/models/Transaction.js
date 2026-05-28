import mongoose from 'mongoose';

const escalationStepSchema = new mongoose.Schema(
  {
    time: String,
    event: String,
    riskAfter: Number,
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    location: { type: String, required: true, trim: true },
    device: { type: String, required: true, trim: true },
    merchantCategory: { type: String, default: 'unknown', trim: true },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    isFraud: { type: Boolean, default: false },
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
    aiConfidence: { type: Number, min: 0, max: 1, default: 0 },
    analysisBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['pending', 'analyzed', 'flagged', 'cleared'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ riskLevel: 1, createdAt: -1 });

export default mongoose.model('Transaction', transactionSchema);
