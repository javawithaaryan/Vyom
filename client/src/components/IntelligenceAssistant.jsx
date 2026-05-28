import { useState } from 'react';
import { ASSISTANT_SUGGESTIONS, getAssistantReply } from '../data/assistantResponses';
import { useGlobalRiskFeed } from '../context/RiskFeedContext';

export default function IntelligenceAssistant() {
  const { feed } = useGlobalRiskFeed();
  const [lastQuestion, setLastQuestion] = useState('');
  const context = {
    lastRiskScore: feed?.[0]?.riskAfter,
    lastSignals: feed?.[0]?.event ? [feed[0].event] : [],
    lastQuestion,
  };
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'I can explain recent risk scores and escalations in plain language. Pick a question below.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const ask = (question) => {
    const q = question.trim();
    if (!q) return;
    // Store the question for memory illusion
    setLastQuestion(q);
    // Show user message immediately
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    // Show typing indicator
    setIsThinking(true);
    // Simulate thinking delay (4-6 seconds)
    const delay = 4000 + Math.random() * 2000;
    setTimeout(() => {
      const reply = getAssistantReply(q, { ...context, lastQuestion: q });
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsThinking(false);
    }, delay);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-teal-700 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-teal-800 min-h-[44px]"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-lg">smart_toy</span>
        Ask Vyom
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[min(100vw-2rem,380px)] glass-card rounded-2xl shadow-xl flex flex-col max-h-[min(70vh,520px)] border border-stone-200">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-stone-900">Intelligence assistant</h2>
            <button type="button" onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-700 p-2" aria-label="Close">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm leading-relaxed rounded-xl px-3 py-2 transition-opacity duration-300 ${
                  m.role === 'user'
                    ? 'bg-teal-700 text-white ml-8 animate-step-in'
                    : 'bg-stone-50 text-stone-800 mr-4 border border-stone-100 animate-step-in'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center space-x-2 text-xs text-stone-500">
                <span className="spinner" />
                <span>Thinking...</span>
              </div>
            )}
            {lastQuestion && (
              <div className="text-xs text-stone-400 mt-2">
                You last asked: "{lastQuestion}"
              </div>
            )}
          </div>

          <div className="p-3 border-t border-stone-100 flex flex-wrap gap-1.5">
            {ASSISTANT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-teal-50 hover:text-teal-900"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="p-3 border-t border-stone-100 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about risk…"
              className="form-input text-sm flex-1"
            />
            <button type="submit" className="form-btn px-4 shrink-0 text-sm">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
