import Alert from '../models/Alert.js';
import { formatRiskLevelDisplay } from '../utils/riskLevels.js';

export async function createRiskAlert({ userId, type, riskScore, riskLevel, relatedId, summary }) {
  const levelLabel = formatRiskLevelDisplay(riskLevel);
  return Alert.create({
    userId,
    type,
    title: type === 'fraud' ? 'Transaction risk elevated' : 'Message risk elevated',
    message: summary || `Risk level reached ${levelLabel} (${riskScore}%).`,
    riskLevel,
    riskScore,
    relatedId,
  });
}

export async function getRecentAlerts(userId, limit = 10) {
  return Alert.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
}
