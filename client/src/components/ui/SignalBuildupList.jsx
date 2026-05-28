export default function SignalBuildupList({ steps = [] }) {
  if (!steps?.length) return null;

  return (
    <ul className="space-y-2 mt-4" aria-label="Risk signals">
      {steps.map((s, i) => (
        <li
          key={`${s.label}-${i}`}
          className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white border border-stone-100 animate-step-in text-sm"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <span className="text-stone-800">{s.label}</span>
          <span className="shrink-0 font-bold text-amber-800 tabular-nums">+{s.delta} risk</span>
        </li>
      ))}
    </ul>
  );
}
