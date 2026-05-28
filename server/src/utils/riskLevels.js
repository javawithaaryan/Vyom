export function scoreToRiskLevel(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export function scoreToScamRiskLevel(score) {
  if (score >= 70) return 'confirmed_scam';
  if (score >= 45) return 'likely_scam';
  if (score >= 20) return 'suspicious';
  return 'safe';
}

export function formatRiskLevelDisplay(level) {
  const map = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    confirmed_scam: 'Confirmed scam',
    likely_scam: 'Likely scam',
    suspicious: 'Suspicious',
    safe: 'Safe',
  };
  return map[level] || level;
}

export function fraudRecommendation(score) {
  if (score >= 85) return 'Delay transaction verification and contact your bank immediately.';
  if (score >= 75) return 'Delay transaction verification until you confirm this was you.';
  if (score >= 50) return 'Review this transaction carefully before approving.';
  if (score >= 25) return 'This looks slightly unusual—worth a quick check.';
  return 'No immediate action needed. We will keep monitoring.';
}

export function scamRecommendation(score) {
  if (score >= 70) return 'Do not reply, click links, or share codes. Report and delete this message.';
  if (score >= 45) return 'Treat this message with caution. Verify the sender through a trusted channel.';
  if (score >= 20) return 'Some wording looks pressuring—double-check before you act.';
  return 'Nothing alarming stood out, but stay cautious with unknown senders.';
}
