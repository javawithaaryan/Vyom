function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function HighlightedMessage({ text = '', phrases = [] }) {
  if (!phrases?.length) {
    return <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{text}</p>;
  }

  const pattern = new RegExp(`(${phrases.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) =>
        phrases.some((p) => p.toLowerCase() === part.toLowerCase()) ? (
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
