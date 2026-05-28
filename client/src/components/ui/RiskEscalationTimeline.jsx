import { useLiveEscalation } from '../../hooks/useRiskFeed';

function riskTone(score) {
  if (score >= 75) return 'text-red-700 bg-red-50 border-red-100';
  if (score >= 50) return 'text-amber-800 bg-amber-50 border-amber-100';
  return 'text-teal-800 bg-teal-50 border-teal-100';
}

export default function RiskEscalationTimeline({ timeline = [], animate = false, emptyMessage }) {
  const steps = useLiveEscalation(timeline, animate);

  if (!steps.length) {
    return (
      <p className="text-sm text-stone-500 py-4">
        {emptyMessage || 'Run an analysis to see how risk builds step by step.'}
      </p>
    );
  }

  return (
    <ol className="space-y-0" aria-label="Risk escalation timeline">
      {steps.map((step, idx) => (
        <li
          key={`${step.time}-${step.event}-${idx}`}
          className={`relative pl-6 pb-4 border-l-2 border-stone-200 last:pb-0 animate-step-in`}
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <span
            className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${
              (step.riskAfter ?? 0) >= 75
                ? 'bg-red-500'
                : (step.riskAfter ?? 0) >= 50
                  ? 'bg-amber-500'
                  : 'bg-teal-600'
            }`}
            aria-hidden
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-stone-800">{step.event}</p>
            <time className="text-xs text-stone-400 tabular-nums">{step.time}</time>
          </div>
          {step.riskAfter != null && (
            <span
              className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${riskTone(step.riskAfter)}`}
            >
              Risk {step.riskAfter}%
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
