import axios from 'axios';
import Transaction from '../models/Transaction.js';
import logger from '../config/logger.js';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';

function ruleBasedScore(amount, location, device) {
  let score = 0;
  const signals = [];

  // Amount-based risk
  if (amount > 50000) { score += 35; signals.push('very_high_amount'); }
  else if (amount > 10000) { score += 20; signals.push('high_amount'); }
  else if (amount > 5000) { score += 10; signals.push('elevated_amount'); }

  // Location risk patterns
  const highRiskLocations = ['foreign', 'international', 'overseas', 'abroad'];
  if (highRiskLocations.some((l) => location.toLowerCase().includes(l))) {
    score += 20;
    signals.push('foreign_location');
  }

  // Device risk patterns
  const riskyDevices = ['unknown', 'new device', 'unrecognized', 'rooted', 'emulator'];
  if (riskyDevices.some((d) => device.toLowerCase().includes(d))) {
    score += 25;
    signals.push('suspicious_device');
  }

  // Time-based risk (odd hours increase suspicion)
  const hour = new Date().getHours();
  if (hour >= 1 && hour <= 5) {
    score += 10;
    signals.push('unusual_hour');
  }

  return { score: Math.min(score, 100), signals };
}

function scoreToRiskLevel(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export async function analyzeTransaction({ userId, amount, location, device, merchantCategory }) {
  const { score: ruleScore, signals } = ruleBasedScore(amount, location, device);

  let aiScore = null;
  let aiConfidence = 0;
  let breakdown = { rule_based: ruleScore };

  // Try AI engine, degrade gracefully if unavailable
  try {
    const { data } = await axios.post(
      `${AI_ENGINE_URL}/predict/fraud`,
      { amount, location, device, merchant_category: merchantCategory || 'unknown' },
      { timeout: 4000 }
    );
    aiScore = data.risk_score;
    aiConfidence = data.confidence;
    breakdown = { ...breakdown, ...data.breakdown };
  } catch (err) {
    logger.warn('AI engine unavailable for fraud analysis, using rule-based only', {
      error: err.message,
    });
  }

  // Blend scores: AI gets 60% weight if available, rules 40%
  const finalScore =
    aiScore !== null
      ? Math.round(aiScore * 0.6 + ruleScore * 0.4)
      : ruleScore;

  const riskLevel = scoreToRiskLevel(finalScore);
  const isFraud = finalScore >= 60;

  const transaction = await Transaction.create({
    userId,
    amount,
    location,
    device,
    merchantCategory: merchantCategory || 'unknown',
    riskScore: finalScore,
    riskLevel,
    isFraud,
    signals,
    aiConfidence,
    analysisBreakdown: breakdown,
    status: isFraud ? 'flagged' : 'analyzed',
  });

  logger.info('Transaction analyzed', {
    transactionId: transaction._id,
    userId,
    riskScore: finalScore,
    riskLevel,
    isFraud,
  });

  return transaction;
}

export async function getTransactionHistory(userId, limit = 20) {
  return Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getDashboardStats(userId) {
  const [total, flagged, recent] = await Promise.all([
    Transaction.countDocuments({ userId }),
    Transaction.countDocuments({ userId, isFraud: true }),
    Transaction.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const avgRisk = await Transaction.aggregate([
    { $match: { userId: userId } },
    { $group: { _id: null, avg: { $avg: '$riskScore' } } },
  ]);

  return {
    total,
    flagged,
    cleared: total - flagged,
    avgRiskScore: Math.round(avgRisk[0]?.avg || 0),
    recent,
  };
}
