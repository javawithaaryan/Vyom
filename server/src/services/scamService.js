import axios from 'axios';
import ScamMessage from '../models/ScamMessage.js';
import RiskEvent from '../models/RiskEvent.js';
import logger from '../config/logger.js';
import { analyzeScamSignals } from './scamAnalyzer.js';
import { mergeScamAnalysis } from './aiMergeService.js';
import { createRiskAlert } from './alertService.js';
import { scoreToScamRiskLevel, scamRecommendation } from '../utils/riskLevels.js';
import { sanitizeText } from '../utils/sanitize.js';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';

function formatScamResponse(doc) {
  const breakdown = doc.breakdown || {};
  return {
    id: doc._id,
    content: doc.content,
    riskScore: doc.riskScore,
    riskLevel: doc.riskLevel,
    signals: doc.signals,
    signalDetails: doc.signalDetails,
    escalationTimeline: doc.escalationTimeline,
    recommendation: doc.recommendation,
    humanSummary: doc.humanSummary,
    aiReasoning: breakdown.aiReasoning,
    confidenceExplanation: breakdown.confidenceExplanation,
    confidencePercent: doc.aiConfidence ? Math.round(doc.aiConfidence * 100) : null,
    highlightedPhrases: doc.highlightedPhrases,
    weightedSignals: breakdown.weightedSignals || [],
    categories: doc.categories,
    aiConfidence: doc.aiConfidence,
    analysisSource: breakdown.source || 'rules',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function callAiScamEngine(content) {
  const { data } = await axios.post(`${AI_ENGINE_URL}/predict/scam`, { content }, { timeout: 5000 });
  return data;
}

export async function analyzeScamMessage({ userId, content, io }) {
  const cleanContent = sanitizeText(content);
  const ruleEscalation = analyzeScamSignals(cleanContent);

  let merged = {
    ...ruleEscalation,
    recommendation: scamRecommendation(ruleEscalation.riskScore),
  };
  let breakdown = { pattern_escalation: ruleEscalation.riskScore, source: 'rules' };

  try {
    const aiData = await callAiScamEngine(cleanContent);
    merged = mergeScamAnalysis(ruleEscalation, aiData);
    breakdown = {
      source: merged.source,
      pattern_escalation: ruleEscalation.riskScore,
      ai_engine: aiData.breakdown,
      ai_reasoning: merged.aiReasoning,
      weighted_signals: merged.weightedSignals,
      confidence_explanation: merged.confidenceExplanation,
    };
  } catch (err) {
    logger.warn('AI engine unavailable for scam analysis', { error: err.message });
  }

  const riskLevel = scoreToScamRiskLevel(merged.riskScore);
  const recommendation = merged.recommendation || scamRecommendation(merged.riskScore);
  const isScam = merged.riskScore >= 45;

  const record = await ScamMessage.create({
    userId,
    content: cleanContent,
    riskScore: merged.riskScore,
    riskLevel,
    isScam,
    signals: merged.signals,
    signalDetails: merged.signalDetails,
    escalationTimeline: merged.escalationTimeline,
    recommendation,
    humanSummary: merged.humanSummary,
    highlightedPhrases: merged.highlightedPhrases,
    categories: merged.categories,
    aiConfidence: merged.aiConfidence || 0,
    breakdown,
  });

  const riskEvent = await RiskEvent.create({
    userId,
    sourceType: 'scam',
    sourceId: record._id,
    baseRisk: 12,
    finalRisk: merged.riskScore,
    riskLevel,
    signals: merged.signals,
    signalDetails: merged.signalDetails,
    escalationTimeline: merged.escalationTimeline,
    recommendation,
    humanSummary: merged.humanSummary,
  });

  if (merged.riskScore >= 45) {
    await createRiskAlert({
      userId,
      type: 'scam',
      riskScore: merged.riskScore,
      riskLevel,
      relatedId: record._id,
      summary: merged.humanSummary,
    });
  }

  if (io) {
    const { broadcastAnalysis } = await import('../socket/index.js');
    broadcastAnalysis(io, userId, {
      type: 'scam',
      messageId: record._id,
      riskScore: merged.riskScore,
      riskLevel,
      humanSummary: merged.humanSummary,
      highlightedPhrases: merged.highlightedPhrases,
      escalationTimeline: merged.escalationTimeline,
      recommendation,
      aiReasoning: merged.aiReasoning,
      confidenceExplanation: merged.confidenceExplanation,
      riskEventId: riskEvent._id,
    });
  }

  logger.info('Scam message analyzed', {
    messageId: record._id,
    userId,
    riskScore: merged.riskScore,
    riskLevel,
    source: breakdown.source,
  });

  return formatScamResponse(record);
}

export async function getScamHistory(userId, limit = 20) {
  const rows = await ScamMessage.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  return rows.map((r) => formatScamResponse(r));
}
