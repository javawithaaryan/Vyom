function dotClass(level) {
  if (level === 'critical' || level === 'high' || level === 'High') return 'bg-red-500 ring-red-100';
  if (level === 'medium' || level === 'Medium') return 'bg-amber-500 ring-amber-100';
  return 'bg-teal-600 ring-teal-100';
}

export default function RiskFeed({ items = [], title = 'Live risk activity', emptyMessage }) {
  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col h-full min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h4>
        <span className="relative flex h-2 w-2" aria-label="Live">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[280px]">
        {items.length === 0 ? (
          <p className="text-sm text-stone-500 leading-relaxed">
            {emptyMessage ||
              'Nothing flagged yet today. That’s a good sign—we’ll post updates here as we analyze activity.'}
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="relative pl-5 border-l-2 border-stone-200">
              <div
                className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-4 ${dotClass(item.riskLevel || item.risk)}`}
              />
              <p className="text-sm font-medium text-stone-800 leading-snug">{item.event}</p>
              <p className="text-xs text-stone-500 mt-0.5 flex justify-between gap-2">
                <span className="capitalize">{item.type === 'scam' ? 'Message' : 'Transaction'}</span>
                <span className="tabular-nums">{item.time}</span>
              </p>
              {item.riskAfter != null && (
                <p className="text-xs font-semibold text-stone-600 mt-1">Risk reached {item.riskAfter}%</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
