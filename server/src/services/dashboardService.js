import Transaction from '../models/Transaction.js';
import ScamMessage from '../models/ScamMessage.js';
import RiskEvent from '../models/RiskEvent.js';
import Alert from '../models/Alert.js';

export async function getDashboardData(userId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    fraudTotal,
    fraudFlagged,
    scamTotal,
    scamFlagged,
    avgFraudRisk,
    recentTransactions,
    recentScams,
    recentRiskEvents,
    recentAlerts,
    escalationLogs,
    weeklyFraud,
    weeklyScam,
  ] = await Promise.all([
    Transaction.countDocuments({ userId }),
    Transaction.countDocuments({ userId, isFraud: true }),
    ScamMessage.countDocuments({ userId }),
    ScamMessage.countDocuments({ userId, isScam: true }),
    Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: '$riskScore' } } },
    ]),
    Transaction.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ScamMessage.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    RiskEvent.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
    Alert.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    RiskEvent.find({ userId, 'escalationTimeline.1': { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('sourceType finalRisk riskLevel escalationTimeline recommendation createdAt')
      .lean(),
    Transaction.aggregate([
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          flagged: { $sum: { $cond: ['$isFraud', 1, 0] } },
          avgRisk: { $avg: '$riskScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    ScamMessage.aggregate([
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          flagged: { $sum: { $cond: ['$isScam', 1, 0] } },
          avgRisk: { $avg: '$riskScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const recentAnalyses = [
    ...recentTransactions.map((t) => ({
      id: t._id,
      type: 'fraud',
      riskScore: t.riskScore,
      riskLevel: t.riskLevel,
      summary: t.signals?.[0] || t.recommendation,
      recommendation: t.recommendation,
      createdAt: t.createdAt,
    })),
    ...recentScams.map((s) => ({
      id: s._id,
      type: 'scam',
      riskScore: s.riskScore,
      riskLevel: s.riskLevel,
      summary: s.humanSummary,
      recommendation: s.recommendation,
      createdAt: s.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 15);

  const fraudEvents = recentTransactions
    .filter((t) => t.isFraud || t.riskScore >= 50)
    .map((t) => ({
      id: t._id,
      amount: t.amount,
      location: t.location,
      riskScore: t.riskScore,
      riskLevel: t.riskLevel,
      signals: t.signals,
      escalationTimeline: t.escalationTimeline,
      createdAt: t.createdAt,
    }));

  const riskHistory = recentRiskEvents.map((e) => ({
    id: e._id,
    sourceType: e.sourceType,
    sourceId: e.sourceId,
    finalRisk: e.finalRisk,
    riskLevel: e.riskLevel,
    signals: e.signals,
    escalationTimeline: e.escalationTimeline,
    recommendation: e.recommendation,
    humanSummary: e.humanSummary,
    createdAt: e.createdAt,
  }));

  const avgRiskScore = Math.round(avgFraudRisk[0]?.avg || 0);

  return {
    summary: {
      fraud: {
        total: fraudTotal,
        flagged: fraudFlagged,
        cleared: fraudTotal - fraudFlagged,
        avgRiskScore,
      },
      scam: {
        total: scamTotal,
        flagged: scamFlagged,
        safe: scamTotal - scamFlagged,
      },
    },
    recentAnalyses,
    riskHistory,
    fraudEvents,
    escalationLogs,
    alerts: recentAlerts,
    weeklyTrend: {
      fraud: weeklyFraud,
      scam: weeklyScam,
    },
    recent: {
      transactions: recentTransactions,
      scams: recentScams,
    },
    // Backward-compatible shape for existing client dashboard
    fraud: {
      total: fraudTotal,
      flagged: fraudFlagged,
      cleared: fraudTotal - fraudFlagged,
      avgRiskScore,
      recent: recentTransactions,
    },
    scam: {
      total: scamTotal,
      flagged: scamFlagged,
      safe: scamTotal - scamFlagged,
      recent: recentScams,
    },
    weeklyTrendLegacy: weeklyFraud,
  };
}
