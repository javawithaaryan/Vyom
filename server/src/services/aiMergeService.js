/**
 * Merge rule-based escalation (Node) with AI engine enrichment (Python).
 */

function mergeTimelines(primary = [], secondary = []) {
  const seen = new Set();
  const merged = [];

  for (const step of [...primary, ...secondary]) {
    const key = `${step.event}|${step.riskAfter}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(step);
  }

  return merged.sort((a, b) => (a.riskAfter ?? 0) - (b.riskAfter ?? 0));
}

function mergeSignals(primary = [], secondary = []) {
  return [...new Set([...primary, ...secondary].filter(Boolean))].slice(0, 8);
}

/**
 * @param {Object} ruleResult - output from fraudAnalyzer / scamAnalyzer
 * @param {Object|null} aiData - AI engine JSON
 * @param {{ ruleWeight?: number, aiWeight?: number }} weights
 */
export function mergeFraudAnalysis(ruleResult, aiData, weights = { ruleWeight: 0.55, aiWeight: 0.45 }) {
  if (!aiData?.risk_score && aiData?.risk_score !== 0) {
    return {
      ...ruleResult,
      aiConfidence: 0,
      aiReasoning: null,
      confidenceExplanation: null,
      humanSummary: ruleResult.recommendation || null,
      source: 'rules',
    };
  }

  const blendedScore = Math.min(
    100,
    Math.round(ruleResult.riskScore * weights.ruleWeight + aiData.risk_score * weights.aiWeight)
  );

  const timeline = mergeTimelines(
    ruleResult.escalationTimeline,
    aiData.escalation_timeline || []
  );
  if (timeline.length) {
    timeline[timeline.length - 1].riskAfter = blendedScore;
  }

  const reasoning = aiData.reasoning || {};
  const humanSummary =
    reasoning.summary ||
    aiData.human_summary ||
    'This transaction was reviewed using behavioral and network signals.';

  return {
    ...ruleResult,
    riskScore: blendedScore,
    signals: mergeSignals(ruleResult.signals, aiData.signals),
    escalationTimeline: timeline,
    aiConfidence: aiData.confidence ?? 0,
    confidenceExplanation:
      reasoning.confidence_explanation || aiData.confidence_explanation || null,
    aiReasoning: {
      summary: humanSummary,
      whyIncreased: reasoning.why_increased || null,
      behaviorChange: reasoning.behavior_change || null,
      topSignals: reasoning.top_signals || aiData.signals?.slice(0, 5) || [],
    },
    humanSummary,
    recommendation: reasoning.recommendation || aiData.recommendation || ruleResult.recommendation,
    weightedSignals: aiData.weighted_signals || [],
    aiBreakdown: aiData.breakdown || {},
    source: 'rules+ai',
  };
}

export function mergeScamAnalysis(ruleResult, aiData, weights = { ruleWeight: 0.5, aiWeight: 0.5 }) {
  if (!aiData?.risk_score && aiData?.risk_score !== 0) {
    return {
      ...ruleResult,
      aiConfidence: 0,
      aiReasoning: null,
      confidenceExplanation: null,
      source: 'rules',
    };
  }

  const blendedScore = Math.min(
    100,
    Math.round(ruleResult.riskScore * weights.ruleWeight + aiData.risk_score * weights.aiWeight)
  );

  const timeline = mergeTimelines(
    ruleResult.escalationTimeline,
    aiData.escalation_timeline || []
  );
  if (timeline.length) {
    timeline[timeline.length - 1].riskAfter = blendedScore;
  }

  const reasoning = aiData.reasoning || {};
  const humanSummary =
    reasoning.summary ||
    aiData.human_summary ||
    ruleResult.humanSummary;

  const highlightedPhrases = mergeSignals(
    ruleResult.highlightedPhrases,
    aiData.highlighted_phrases || []
  );

  return {
    ...ruleResult,
    riskScore: blendedScore,
    signals: mergeSignals(ruleResult.signals, aiData.signals),
    escalationTimeline: timeline,
    highlightedPhrases: highlightedPhrases,
    humanSummary,
    categories: aiData.categories?.length ? aiData.categories : ruleResult.categories,
    aiConfidence: aiData.confidence ?? 0,
    confidenceExplanation:
      reasoning.confidence_explanation || aiData.confidence_explanation || null,
    aiReasoning: {
      summary: humanSummary,
      whyIncreased: reasoning.why_increased || null,
      behaviorChange: reasoning.behavior_change || null,
      topSignals: reasoning.top_signals || [],
    },
    recommendation: reasoning.recommendation || aiData.recommendation || ruleResult.recommendation,
    weightedSignals: aiData.weighted_signals || [],
    aiBreakdown: aiData.breakdown || {},
    source: 'rules+ai',
  };
}
