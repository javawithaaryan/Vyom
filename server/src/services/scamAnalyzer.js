import { buildRiskEscalation } from './riskEngine.js';

const SCAM_PATTERNS = [
  {
    id: 'urgency_language',
    label: 'Urgency and payment pressure language detected',
    weight: 18,
    pattern: /\b(urgent|immediately|right now|act now|expire[sd]?|limited time|last chance)\b/i,
    category: 'urgency_manipulation',
    phrasePattern: /\b(urgent|immediately|right now|act now|expire[sd]?)\b/gi,
  },
  {
    id: 'payment_pressure',
    label: 'Payment or transfer pressure detected',
    weight: 20,
    pattern: /\b(send money|wire transfer|pay now|transfer funds|bitcoin|crypto|gift card)\b/i,
    category: 'financial_fraud',
    phrasePattern: /\b(send money|wire transfer|pay now|transfer funds)\b/gi,
  },
  {
    id: 'credential_request',
    label: 'Request for sensitive credentials detected',
    weight: 25,
    pattern: /\b(otp|password|pin|cvv|security code|one.time.pass)\b/i,
    category: 'identity_theft',
    phrasePattern: /\b(otp|password|pin|cvv|security code)\b/gi,
  },
  {
    id: 'phishing_link',
    label: 'Suspicious link or account verification language',
    weight: 16,
    pattern: /\b(click here|verify your account|confirm your identity|update your details)\b/i,
    category: 'phishing',
    phrasePattern: /\b(click here|verify your account|confirm your identity)\b/gi,
  },
  {
    id: 'prize_scam',
    label: 'Prize or lottery-style reward language detected',
    weight: 18,
    pattern: /\b(lottery|won|winner|prize|congratulations|selected|free money)\b/i,
    category: 'prize_scam',
    phrasePattern: /\b(lottery|won|winner|prize|congratulations)\b/gi,
  },
  {
    id: 'account_threat',
    label: 'Account suspension or lockout threat detected',
    weight: 20,
    pattern: /\b(suspended|blocked|disabled|restricted)\b.{0,40}\b(account|card)\b/i,
    category: 'urgency_manipulation',
    phrasePattern: /\b(suspended|blocked|disabled|restricted)\b/gi,
  },
  {
    id: 'impersonation',
    label: 'Government or institution impersonation cues detected',
    weight: 15,
    pattern: /\b(irs|hmrc|tax refund|government|customs|your bank)\b/i,
    category: 'impersonation',
    phrasePattern: /\b(irs|hmrc|tax refund|government|your bank)\b/gi,
  },
];

function extractHighlightedPhrases(content) {
  const found = new Set();
  for (const { phrasePattern } of SCAM_PATTERNS) {
    const matches = content.match(phrasePattern);
    if (matches) {
      matches.forEach((m) => found.add(m.trim()));
    }
  }
  return [...found].slice(0, 8);
}

export function analyzeScamSignals(content) {
  const categories = new Set();
  const matchedPatternIds = new Set();

  const checks = SCAM_PATTERNS.map((p) => ({
    id: p.id,
    label: p.label,
    weight: p.weight,
    detect: () => {
      const hit = p.pattern.test(content);
      if (hit) {
        categories.add(p.category);
        matchedPatternIds.add(p.id);
      }
      return hit;
    },
  }));

  // Stylistic pressure
  const capsRatio =
    content.length > 20 ? (content.match(/[A-Z]/g) || []).length / content.length : 0;
  if (capsRatio > 0.4) {
    checks.push({
      id: 'excessive_caps',
      label: 'Excessive capitalization suggesting pressure tactics',
      weight: 10,
      detect: () => true,
    });
    categories.add('urgency_manipulation');
  }

  const escalation = buildRiskEscalation({
    baseRisk: 12,
    baseEvent: 'Message scanned for phishing patterns',
    checks,
  });

  const highlightedPhrases = extractHighlightedPhrases(content);

  let humanSummary =
    'This message does not show strong scam patterns based on the language we analyzed.';
  if (escalation.riskScore >= 70) {
    humanSummary =
      'Urgency and payment pressure language detected. This message closely resembles known phishing behavior.';
  } else if (escalation.riskScore >= 45) {
    humanSummary =
      'Several phrases in this message match common scam tactics. Proceed with caution before replying or clicking anything.';
  } else if (escalation.riskScore >= 20) {
    humanSummary =
      'Some wording feels pressuring or unusual. It may be worth verifying the sender through a trusted channel.';
  }

  return {
    ...escalation,
    categories: categories.size ? [...categories] : ['safe'],
    highlightedPhrases,
    humanSummary,
  };
}
