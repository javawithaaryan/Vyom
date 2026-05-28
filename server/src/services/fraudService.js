import axios from 'axios';
import Transaction from '../models/Transaction.js';
import RiskEvent from '../models/RiskEvent.js';
import logger from '../config/logger.js';
import { analyzeFraudSignals } from './fraudAnalyzer.js';
import { mergeFraudAnalysis } from './aiMergeService.js';
import { createRiskAlert } from './alertService.js';
import { scoreToRiskLevel, fraudRecommendation } from '../utils/riskLevels.js';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';

function formatFraudResponse(doc) {
  const breakdown = doc.analysisBreakdown || {};
  return {
    id: doc._id,
    riskScore: doc.riskScore,
    riskLevel: doc.riskLevel,
    signals: doc.signals,
    signalDetails: doc.signalDetails,
    escalationTimeline: doc.escalationTimeline,
    recommendation: doc.recommendation,
    humanSummary: doc.humanSummary,
    aiReasoning: breakdown.aiReasoning || doc.aiReasoning,
    confidenceExplanation: breakdown.confidenceExplanation || doc.confidenceExplanation,
    confidencePercent: doc.aiConfidence ? Math.round(doc.aiConfidence * 100) : null,
    weightedSignals: breakdown.weightedSignals || [],
    amount: doc.amount,
    location: doc.location,
    device: doc.device,
    merchantCategory: doc.merchantCategory,
    aiConfidence: doc.aiConfidence,
    analysisSource: breakdown.source || 'rules',
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function callAiFraudEngine(payload) {
  const { data } = await axios.post(`${AI_ENGINE_URL}/predict/fraud`, payload, {
    timeout: 5000,
  });
  return data;
}

export async function analyzeTransaction({ userId, amount, location, device, merchantCategory, io }) {
  const ruleEscalation = await analyzeFraudSignals({
    userId,
    amount,
    location,
    device,
    merchantCategory,
  });

  let merged = {
    ...ruleEscalation,
    recommendation: fraudRecommendation(ruleEscalation.riskScore),
  };
  let breakdown = { rule_escalation: ruleEscalation.riskScore, source: 'rules' };

  try {
    const aiData = await callAiFraudEngine({
      amount,
      location,
      device,
      merchant_category: merchantCategory || 'unknown',
    });
    merged = mergeFraudAnalysis(ruleEscalation, aiData);
    breakdown = {
      source: merged.source,
      rule_escalation: ruleEscalation.riskScore,
      ai_engine: aiData.breakdown,
      ai_reasoning: merged.aiReasoning,
      weighted_signals: merged.weightedSignals,
      confidence_explanation: merged.confidenceExplanation,
    };
  } catch (err) {
    logger.warn('AI engine unavailable for fraud analysis', { error: err.message });
    merged.humanSummary =
      merged.humanSummary ||
      'We analyzed this transaction using on-platform behavioral rules. AI reasoning is temporarily unavailable.';
  }

  const riskLevel = scoreToRiskLevel(merged.riskScore);
  const recommendation = merged.recommendation || fraudRecommendation(merged.riskScore);
  const isFraud = merged.riskScore >= 60;

  const transaction = await Transaction.create({
    userId,
    amount,
    location,
    device,
    merchantCategory: merchantCategory || 'unknown',
    riskScore: merged.riskScore,
    riskLevel,
    isFraud,
    signals: merged.signals,
    signalDetails: merged.signalDetails,
    escalationTimeline: merged.escalationTimeline,
    recommendation,
    humanSummary: merged.humanSummary,
    aiConfidence: merged.aiConfidence || 0,
    analysisBreakdown: breakdown,
    status: isFraud ? 'flagged' : 'analyzed',
  });

  const riskEvent = await RiskEvent.create({
    userId,
    sourceType: 'fraud',
    sourceId: transaction._id,
    baseRisk: 24,
    finalRisk: merged.riskScore,
    riskLevel,
    signals: merged.signals,
    signalDetails: merged.signalDetails,
    escalationTimeline: merged.escalationTimeline,
    recommendation,
    humanSummary: merged.humanSummary,
  });

  if (merged.riskScore >= 50) {
    await createRiskAlert({
      userId,
      type: 'fraud',
      riskScore: merged.riskScore,
      riskLevel,
      relatedId: transaction._id,
      summary: merged.humanSummary || merged.signals[0] || recommendation,
    });
  }

  if (io) {
    const { broadcastAnalysis } = await import('../socket/index.js');
    broadcastAnalysis(io, userId, {
      type: 'fraud',
      transactionId: transaction._id,
      riskScore: merged.riskScore,
      riskLevel,
      signals: merged.signals,
      signalDetails: merged.signalDetails,
      escalationTimeline: merged.escalationTimeline,
      recommendation,
      humanSummary: merged.humanSummary,
      aiReasoning: merged.aiReasoning,
      confidenceExplanation: merged.confidenceExplanation,
      riskEventId: riskEvent._id,
    });
  }

  logger.info('Transaction analyzed', {
    transactionId: transaction._id,
    userId,
    riskScore: merged.riskScore,
    riskLevel,
    source: breakdown.source,
  });

  return formatFraudResponse(transaction);
}

export async function getTransactionHistory(userId, limit = 20) {
  const rows = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return rows.map((t) => formatFraudResponse(t));
}
