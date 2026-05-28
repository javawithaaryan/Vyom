const FALLBACK_PATTERNS = [
  'urgent', 'immediately', 'act now', 'blocked', 'suspended', 'otp', 'password', 'verify',
  'click here', 'wire transfer', 'send money', 'bitcoin', 'gift card', '10 minutes',
  '24 hours', 'congratulations', 'won', 'prize', 'irs', 'your bank',
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function HighlightedMessage({ text = '', phrases = [] }) {
  const combined = [
    ...new Set([
      ...(phrases || []),
      ...FALLBACK_PATTERNS.filter((p) => text.toLowerCase().includes(p.toLowerCase())),
    ]),
  ];

  if (!combined.length) {
    return <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{text}</p>;
  }

  const pattern = new RegExp(`(${combined.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) =>
        combined.some((p) => p.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={i}
            className="bg-amber-100 text-amber-950 rounded px-0.5 font-medium not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
