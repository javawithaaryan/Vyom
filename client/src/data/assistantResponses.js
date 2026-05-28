/**
 * Demo intelligence assistant — predefined answers (no LLM).
 */
export function getAssistantReply(question, context = {}) {
  const q = question.toLowerCase().trim();
  const risk = context?.lastRiskScore ?? context?.avgRiskScore;
  const signals = context?.lastSignals || [];
  const escalation = context?.lastEscalation || [];

  if (q.includes('why') && (q.includes('risk') || q.includes('transaction'))) {
    if (signals.length) {
      return `This transaction looks unusual because ${signals.slice(0, 3).join(', ').toLowerCase()}. Together these patterns pushed the risk score${risk != null ? ` to about ${risk}%` : ''}.`;
    }
    return 'This transaction differs from typical spending behavior we would expect—especially around device trust, location, or amount.';
  }

  if (q.includes('safe') && q.includes('account')) {
    const level = risk >= 70 ? 'elevated' : risk >= 45 ? 'moderate' : 'relatively calm';
    return `Based on recent activity, your account risk looks ${level}${risk != null ? ` (around ${risk}% average exposure)` : ''}. Keep reviewing flagged items, but nothing requires panic if you recognize the activity.`;
  }

  if (q.includes('escalation') || q.includes('caused')) {
    if (escalation.length) {
      const steps = escalation.map((e) => e.event).filter(Boolean).slice(0, 4);
      return `Risk escalated in steps: ${steps.join(' → ')}. Each signal added context until the final level was reached.`;
    }
    return 'Escalation happens when multiple independent signals appear—like a new device, location mismatch, or urgency language—not from a single flag.';
  }

  if (q.includes('approve') || q.includes('payment')) {
    if (risk >= 75) {
      return 'We would not recommend approving this payment until you verify it through your bank’s official app or phone number—not a link in a message.';
    }
    if (risk >= 50) {
      return 'Take a moment to confirm you initiated this payment. If anything feels off, delay approval and contact your bank directly.';
    }
    return 'This payment shows fewer warning signs, but it is still wise to confirm you recognize the merchant and amount.';
  }

  if (q.includes('scam') || q.includes('message') || q.includes('phishing')) {
    return 'This message uses patterns common in scams—pressure to act fast, requests for sensitive details, or impersonation. Do not reply or click links; verify through official channels.';
  }

  return 'I can explain why something was flagged, how safe your recent activity looks, what caused escalation, or whether to approve a payment. Try one of the suggested questions.';
}

export const ASSISTANT_SUGGESTIONS = [
  'Why is this transaction risky?',
  'How safe is my account today?',
  'What caused the escalation?',
  'Should I approve this payment?',
];
