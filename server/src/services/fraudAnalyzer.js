import Transaction from '../models/Transaction.js';
import { buildRiskEscalation } from './riskEngine.js';

const VPN_PROXY_PATTERNS = ['vpn', 'proxy', 'tor', 'anonymizer', 'datacenter'];
const NEW_DEVICE_PATTERNS = ['new device', 'unknown', 'unrecognized', 'first seen', 'unverified'];
const HIGH_RISK_LOCATIONS = ['foreign', 'international', 'overseas', 'abroad', 'mismatch'];
const HIGH_RISK_MERCHANTS = [
  'cryptocurrency',
  'crypto',
  'gambling',
  'wire transfer',
  'money transfer',
  'gift card',
  'prepaid',
];

function includesAny(text, patterns) {
  const lower = text.toLowerCase();
  return patterns.some((p) => lower.includes(p));
}

async function getUserSpendingBaseline(userId) {
  const recent = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('amount location')
    .lean();

  if (!recent.length) {
    return { avgAmount: 500, typicalLocations: [], recentCount: 0 };
  }

  const avgAmount = recent.reduce((s, t) => s + t.amount, 0) / recent.length;
  const typicalLocations = [...new Set(recent.map((t) => t.location.toLowerCase().trim()))];

  return { avgAmount, typicalLocations, recentCount: recent.length };
}

async function getRecentTransactionCount(userId, minutes = 60) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  return Transaction.countDocuments({ userId, createdAt: { $gte: since } });
}

export async function analyzeFraudSignals({ userId, amount, location, device, merchantCategory }) {
  const baseline = await getUserSpendingBaseline(userId);
  const recentInHour = await getRecentTransactionCount(userId, 60);
  const locLower = location.toLowerCase().trim();
  const devLower = device.toLowerCase().trim();
  const merchLower = (merchantCategory || 'unknown').toLowerCase().trim();
  const hour = new Date().getHours();

  const amountRatio = baseline.avgAmount > 0 ? amount / baseline.avgAmount : amount / 500;
  const amountSpikeWeight =
    amountRatio >= 3 ? 28 : amountRatio >= 2 ? 20 : amountRatio >= 1.5 || amount > 10000 ? 15 : 0;

  const checks = [
    {
      id: 'amount_spike',
      label: 'Unusual payment spike compared to your recent activity',
      weight: amountSpikeWeight,
      detect: () => amountSpikeWeight > 0,
    },
    {
      id: 'new_device',
      label: 'New device detected',
      weight: 22,
      detect: () => includesAny(devLower, NEW_DEVICE_PATTERNS),
    },
    {
      id: 'vpn_proxy',
      label: 'VPN or proxy connection identified',
      weight: 18,
      detect: () => includesAny(devLower, VPN_PROXY_PATTERNS),
    },
    {
      id: 'location_mismatch',
      label: 'Location mismatch with your usual spending pattern',
      weight: 20,
      detect: () => {
        if (includesAny(locLower, HIGH_RISK_LOCATIONS)) return true;
        if (baseline.typicalLocations.length === 0) return false;
        const matchesTypical = baseline.typicalLocations.some(
          (t) => locLower.includes(t) || t.includes(locLower)
        );
        return !matchesTypical && baseline.recentCount >= 3;
      },
    },
    {
      id: 'rapid_frequency',
      label: 'Rapid transaction frequency in a short window',
      weight: 15,
      detect: () => recentInHour >= 3,
    },
    {
      id: 'unusual_merchant',
      label: 'Unusual merchant category for this profile',
      weight: 12,
      detect: () => includesAny(merchLower, HIGH_RISK_MERCHANTS) || merchLower === 'unknown',
    },
    {
      id: 'suspicious_timing',
      label: 'Transaction at an unusual time of day',
      weight: 8,
      detect: () => hour >= 1 && hour <= 5,
    },
  ];

  const baseRisk = 24;
  const escalation = buildRiskEscalation({
    baseRisk,
    baseEvent: 'Transaction submitted for risk review',
    checks,
  });

  return {
    ...escalation,
    baseline: { avgAmount: Math.round(baseline.avgAmount), recentInHour },
  };
}
