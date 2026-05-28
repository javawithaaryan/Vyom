import mongoose from 'mongoose';

const escalationStepSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    event: { type: String, required: true },
    riskAfter: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const signalDetailSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    weight: { type: Number },
    riskAfter: { type: Number },
  },
  { _id: false }
);

const riskEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['fraud', 'scam'],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    baseRisk: { type: Number, min: 0, max: 100, default: 0 },
    finalRisk: { type: Number, min: 0, max: 100, required: true },
    riskLevel: { type: String, required: true },
    signals: { type: [String], default: [] },
    signalDetails: { type: [signalDetailSchema], default: [] },
    escalationTimeline: { type: [escalationStepSchema], default: [] },
    recommendation: { type: String, default: '' },
    humanSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

riskEventSchema.index({ userId: 1, createdAt: -1 });
riskEventSchema.index({ sourceType: 1, sourceId: 1 });

export default mongoose.model('RiskEvent', riskEventSchema);
