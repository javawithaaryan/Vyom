import ThinkingPanel from './ThinkingPanel';
import RiskEscalationTimeline from './RiskEscalationTimeline';
import SignalBuildupList from './SignalBuildupList';
import { riskLabel } from '../../utils/helpers';

export default function AnalysisPanel({
  isRunning,
  phase,
  thinkingMessage,
  currentRisk,
  visibleTimeline,
  signalSteps,
  result,
  emptyMessage,
}) {
  if (!isRunning && !result && phase === 'idle') {
    return (
      <p className="text-sm text-stone-500 py-6">{emptyMessage}</p>
    );
  }

  if (isRunning && (phase === 'thinking' || (phase === 'revealing' && !visibleTimeline?.length))) {
    return <ThinkingPanel message={thinkingMessage} currentRisk={currentRisk} />;
  }

  if (isRunning && phase === 'revealing') {
    return (
      <div className="space-y-4">
        <ThinkingPanel message="Building risk picture…" currentRisk={currentRisk} pulse />
        <RiskEscalationTimeline timeline={visibleTimeline} animate={false} />
        <SignalBuildupList steps={signalSteps} />
      </div>
    );
  }

  if (!result) return null;

  const confidence = result?.confidencePercent ?? (result?.aiConfidence != null ? Math.round(result.aiConfidence * 100) : null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-stone-500">Risk score</p>
          <p className="text-4xl font-bold text-stone-900 tabular-nums">{result?.riskScore ?? 0}%</p>
          <p className="text-sm text-stone-600">{riskLabel(result?.riskLevel)}</p>
        </div>
        {confidence != null && (
          <div className="text-right">
            <p className="text-xs font-medium text-stone-500">Confidence</p>
            <p className="text-xl font-semibold text-teal-800">{confidence}%</p>
          </div>
        )}
      </div>

      <p className="text-sm text-stone-700 leading-relaxed">
        {result?.humanSummary || result?.recommendation}
      </p>

      {result?.aiReasoning?.whyIncreased && (
        <p className="text-sm text-stone-600 bg-stone-50 border border-stone-100 rounded-lg p-3">
          {result.aiReasoning.whyIncreased}
        </p>
      )}

      {result?.confidenceExplanation && (
        <p className="text-xs text-stone-500 italic">{result.confidenceExplanation}</p>
      )}

      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Escalation path</h3>
      <RiskEscalationTimeline timeline={result?.escalationTimeline || visibleTimeline} animate={false} />

      <SignalBuildupList
        steps={
          signalSteps?.length
            ? signalSteps
            : (result?.signalDetails || []).map((d) => ({
                label: d.label,
                delta: d.weight,
              }))
        }
      />

      {result?.recommendation && (
        <p className="text-sm font-medium text-teal-900 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
          {result.recommendation}
        </p>
      )}
    </div>
  );
}
