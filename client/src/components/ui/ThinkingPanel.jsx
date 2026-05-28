export default function ThinkingPanel({ message, currentRisk, pulse = true }) {
  return (
    <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-5" role="status" aria-live="polite">
      <div className="flex items-center gap-3 mb-3">
        {pulse && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-70" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600" />
          </span>
        )}
        <p className="text-sm font-medium text-teal-900 animate-pulse-soft">{message}</p>
      </div>
      {currentRisk > 0 && (
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-stone-500">Live risk</span>
          <span className="text-2xl font-bold text-stone-900 tabular-nums">{currentRisk}%</span>
        </div>
      )}
    </div>
  );
}
