/**
 * Live risk escalation: base score + incremental signal steps with timeline.
 */

function formatTimelineTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * @param {Object} options
 * @param {number} options.baseRisk - Starting risk (e.g. 24)
 * @param {string} options.baseEvent - Human label for baseline step
 * @param {Array<{ id: string, label: string, weight: number, detect: () => boolean }>} options.checks
 * @returns {{ riskScore: number, signals: string[], escalationTimeline: Array, signalDetails: Array }}
 */
export function buildRiskEscalation({ baseRisk = 24, baseEvent = 'Analysis started', checks = [] }) {
  const escalationTimeline = [];
  const signals = [];
  const signalDetails = [];
  let currentRisk = baseRisk;
  const startedAt = Date.now();

  escalationTimeline.push({
    time: formatTimelineTime(new Date(startedAt)),
    event: baseEvent,
    riskAfter: Math.round(currentRisk),
  });

  let stepIndex = 1;

  for (const check of checks) {
    if (!check.detect()) continue;

    currentRisk = Math.min(100, currentRisk + check.weight);
    const stepTime = new Date(startedAt + stepIndex * 1000);
    stepIndex += 1;

    escalationTimeline.push({
      time: formatTimelineTime(stepTime),
      event: check.label,
      riskAfter: Math.round(currentRisk),
    });

    signals.push(check.label);
    signalDetails.push({
      id: check.id,
      label: check.label,
      weight: check.weight,
      riskAfter: Math.round(currentRisk),
    });
  }

  return {
    riskScore: Math.round(currentRisk),
    signals,
    escalationTimeline,
    signalDetails,
  };
}
