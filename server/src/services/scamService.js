import axios from 'axios';
import ScamMessage from '../models/ScamMessage.js';
import logger from '../config/logger.js';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';

// Weighted pattern registry
const SCAM_PATTERNS = [
  { pattern: /\b(otp|one.time.passw?o?r?d?)\b/i, weight: 25, signal: 'otp_mention', category: 'phishing' },
  { pattern: /\b(urgent|immediately|right now|act now|expire[sd]?)\b/i, weight: 15, signal: 'urgency', category: 'urgency_manipulation' },
  { pattern: /\b(bank account|account number|sort code|iban|swift)\b/i, weight: 20, signal: 'bank_details_request', category: 'financial_fraud' },
  { pattern: /\b(lottery|won|winner|prize|congratulations|selected)\b/i, weight: 20, signal: 'prize_scam', category: 'prize_scam' },
  { pattern: /\b(click here|tap here|visit.*link|click.*link)\b/i, weight: 15, signal: 'suspicious_link', category: 'phishing' },
  { pattern: /\b(password|pin|cvv|security code)\b/i, weight: 30, signal: 'credential_request', category: 'identity_theft' },
  { pattern: /\b(refund|tax return|government|irs|hmrc|income tax)\b/i, weight: 18, signal: 'gov_impersonation', category: 'impersonation' },
  { pattern: /\b(whatsapp|telegram|signal).*\b(forward|share)\b/i, weight: 12, signal: 'forward_pressure', category: 'urgency_manipulation' },
  { pattern: /\b(free money|cash reward|gift card|amazon gift)\b/i, weight: 22, signal: 'fake_reward', category: 'prize_scam' },
  { pattern: /\b(verify your account|confirm your identity|update.*details)\b/i, weight: 20, signal: 'account_verification_scam', category: 'phishing' },
  { pattern: /https?:\/\/\S*\.(xyz|top|tk|ml|ga|cf|gq)\b/i, weight: 25, signal: 'suspicious_domain', category: 'phishing' },
  { pattern: /\b(suspended|blocked|disabled|restricted)\b.*\b(account|card)\b/i, weight: 22, signal: 'account_threat', category: 'urgency_manipulation' },
];

function ruleBasedScamScore(content) {
  let score = 0;
  const signals = [];
  const categories = new Set();

  for (const { pattern, weight, signal, category } of SCAM_PATTERNS) {
    if (pattern.test(content)) {
      score += weight;
      signals.push(signal);
      categories.add(category);
    }
  }

  // Excessive punctuation / ALL CAPS raises suspicion
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.4 && content.length > 20) {
    score += 10;
    signals.push('excessive_caps');
  }

  return {
    score: Math.min(score, 100),
    signals,
    categories: categories.size ? [...categories] : ['safe'],
  };
}

function scoreToRiskLevel(score) {
  if (score >= 70) return 'confirmed_scam';
  if (score >= 45) return 'likely_scam';
  if (score >= 20) return 'suspicious';
  return 'safe';
}

export async function analyzeScamMessage({ userId, content }) {
  const { score: ruleScore, signals, categories } = ruleBasedScamScore(content);

  let aiScore = null;
  let aiConfidence = 0;
  let breakdown = { rule_based: ruleScore, signals_matched: signals.length };

  try {
    const { data } = await axios.post(
      `${AI_ENGINE_URL}/predict/scam`,
      { content },
      { timeout: 4000 }
    );
    aiScore = data.risk_score;
    aiConfidence = data.confidence;
    breakdown = { ...breakdown, ...data.breakdown };
  } catch (err) {
    logger.warn('AI engine unavailable for scam analysis, using rule-based only', {
      error: err.message,
    });
  }

  const finalScore =
    aiScore !== null
      ? Math.round(aiScore * 0.55 + ruleScore * 0.45)
      : ruleScore;

  const riskLevel = scoreToRiskLevel(finalScore);
  const isScam = finalScore >= 45;

  const record = await ScamMessage.create({
    userId,
    content,
    riskScore: finalScore,
    riskLevel,
    isScam,
    signals,
    categories,
    aiConfidence,
    breakdown,
  });

  logger.info('Scam message analyzed', {
    messageId: record._id,
    userId,
    riskScore: finalScore,
    riskLevel,
    isScam,
    signals,
  });

  return record;
}

export async function getScamHistory(userId, limit = 20) {
  return ScamMessage.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
}
