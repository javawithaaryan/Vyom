import { useState, useEffect } from 'react';
import { scamApi } from '../services/api';
import { useRiskFeed } from '../hooks/useRiskFeed';
import { getErrorMessage, riskLabel } from '../utils/helpers';
import RiskEscalationTimeline from './ui/RiskEscalationTimeline';
import HighlightedMessage from './ui/HighlightedMessage';
import EmptyState from './ui/EmptyState';

function mapHistoryItem(h) {
  return {
    id: h.id || h._id,
    body: h.content,
    receivedOn: new Date(h.createdAt).toLocaleString(),
    riskScore: h.riskScore,
    riskLevel: h.riskLevel,
    humanSummary: h.humanSummary,
    signals: h.signals || [],
    highlightedPhrases: h.highlightedPhrases || [],
    escalationTimeline: h.escalationTimeline || [],
    recommendation: h.recommendation,
    aiReasoning: h.aiReasoning,
    confidenceExplanation: h.confidenceExplanation,
    confidencePercent: h.confidencePercent ?? (h.aiConfidence ? Math.round(h.aiConfidence * 100) : null),
    analyzed: h.riskScore != null,
  };
}

export default function InboxView() {
  const [messages, setMessages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [customBody, setCustomBody] = useState('');
  const [customSender, setCustomSender] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [animateTimeline, setAnimateTimeline] = useState(false);
  const [error, setError] = useState('');

  const { feed, pushFeed } = useRiskFeed([]);

  const fetchHistory = async () => {
    try {
      const res = await scamApi.history(25);
      const list = (res.data.data || []).map(mapHistoryItem);
      setMessages(list);
      if (list.length && !activeId) setActiveId(list[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const active = messages.find((m) => m.id === activeId) || messages[0];
  const filtered = messages.filter((m) => m.body?.toLowerCase().includes(search.toLowerCase()));

  const runAnalyze = async (content) => {
    setAnalyzing(true);
    setError('');
    setAnimateTimeline(false);

    try {
      const res = await scamApi.analyze({ content });
      const data = mapHistoryItem({ ...res.data.data, content });
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== data.id);
        return [data, ...without];
      });
      setActiveId(data.id);
      setAnimateTimeline(true);
      pushFeed({
        id: `scam-${data.id}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: data.escalationTimeline?.[data.escalationTimeline.length - 1]?.event || 'Message analyzed',
        riskAfter: data.riskScore,
        riskLevel: data.riskLevel,
        type: 'scam',
      });
      return data;
    } catch (err) {
      setError(getErrorMessage(err) || "We couldn't scan this message. Please try again.");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customBody.trim()) return;
    const content = `From: ${customSender}\nSubject: ${customSubject}\n\n${customBody}`;
    const ok = await runAnalyze(content);
    if (ok) {
      setCustomOpen(false);
      setCustomBody('');
      setCustomSender('');
      setCustomSubject('');
    }
  };

  return (
    <div className="space-y-4 max-w-7xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Message check</h1>
        <p className="text-sm text-stone-500 mt-1">
          Paste suspicious text—we highlight pressure phrases and show how risk escalates.
        </p>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr_minmax(280px,340px)] gap-0 lg:gap-0 bg-white border border-stone-200 rounded-2xl overflow-hidden min-h-[min(70vh,640px)] shadow-sm">
        {/* List */}
        <aside className="border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col bg-stone-50/50">
          <div className="p-4 border-b border-stone-200 space-y-3">
            <div className="flex justify-between items-center gap-2">
              <h2 className="text-sm font-semibold text-stone-800">History</h2>
              <button
                type="button"
                onClick={() => setCustomOpen(!customOpen)}
                className="text-xs font-semibold text-teal-700 hover:underline min-h-[44px] px-2"
              >
                {customOpen ? 'Cancel' : 'New scan'}
              </button>
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages…"
              className="form-input text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {customOpen ? (
              <form onSubmit={handleCustomSubmit} className="p-3 space-y-3 bg-white rounded-xl border border-stone-200">
                <input
                  className="form-input text-sm"
                  placeholder="Sender (optional)"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                />
                <input
                  className="form-input text-sm"
                  placeholder="Subject (optional)"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
                <textarea
                  className="form-input text-sm resize-none"
                  rows={5}
                  required
                  placeholder="Paste the full message here…"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                />
                <button type="submit" className="form-btn w-full text-sm" disabled={analyzing}>
                  {analyzing ? 'Scanning…' : 'Scan message'}
                </button>
              </form>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="mail"
                title="No messages yet"
                description="Scan a suspicious email or SMS to see human-readable results here."
              />
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveId(m.id)}
                  className={`w-full text-left p-3 rounded-xl mb-2 transition-colors min-h-[44px] ${
                    active?.id === m.id ? 'bg-white border border-teal-200 shadow-sm' : 'hover:bg-white/80'
                  }`}
                >
                  <p className="text-xs text-stone-500">{m.receivedOn}</p>
                  <p className="text-sm font-medium text-stone-800 line-clamp-2 mt-1">{m.body}</p>
                  {m.analyzed && (
                    <p className="text-xs font-semibold text-teal-800 mt-2">{m.riskScore}% · {riskLabel(m.riskLevel)}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Body */}
        <section className="flex flex-col border-b lg:border-b-0 lg:border-r border-stone-200 min-h-[240px]">
          {!active?.id && !customOpen ? (
            <EmptyState
              icon="mark_email_unread"
              title="Select or scan a message"
              description="Choose from history or start a new scan to review content safely."
            />
          ) : active && !customOpen ? (
            <div className="flex-1 overflow-y-auto p-5">
              <p className="text-xs text-stone-500 mb-3">{active.receivedOn}</p>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                <HighlightedMessage text={active.body} phrases={active.highlightedPhrases} />
              </div>
              {!active.analyzed && (
                <button
                  type="button"
                  onClick={() => runAnalyze(active.body)}
                  disabled={analyzing}
                  className="form-btn mt-4 max-w-xs"
                >
                  {analyzing ? 'Scanning…' : 'Analyze this message'}
                </button>
              )}
            </div>
          ) : null}
        </section>

        {/* Analysis panel */}
        <aside className="flex flex-col bg-stone-50/30 p-5 overflow-y-auto">
          {active?.analyzed ? (
            <>
              <p className="text-xs font-semibold uppercase text-stone-500 mb-2">Risk score</p>
              <p className="text-3xl font-bold text-stone-900">{active.riskScore}%</p>
              <p className="text-sm text-stone-600 mb-4">{riskLabel(active.riskLevel)}</p>

              <p className="text-sm text-stone-700 leading-relaxed mb-4">
                {active.humanSummary}
              </p>

              {active.aiReasoning?.whyIncreased && (
                <p className="text-xs text-stone-600 bg-white border border-stone-100 rounded-lg p-3 mb-4">
                  {active.aiReasoning.whyIncreased}
                </p>
              )}

              {active.confidenceExplanation && (
                <p className="text-xs text-stone-500 italic mb-4">{active.confidenceExplanation}</p>
              )}

              <h3 className="text-xs font-semibold uppercase text-stone-500 mb-2">Escalation</h3>
              <RiskEscalationTimeline
                timeline={active.escalationTimeline}
                animate={animateTimeline && active.id === activeId}
              />

              {active.highlightedPhrases?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-stone-500 mb-2">Flagged phrases</p>
                  <div className="flex flex-wrap gap-1.5">
                    {active.highlightedPhrases.map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-4 text-sm text-teal-900 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                {active.recommendation}
              </p>
            </>
          ) : (
            <p className="text-sm text-stone-500">
              Analysis results will appear here with escalation steps and highlighted phrases.
            </p>
          )}
        </aside>
      </div>

      {feed.length > 0 && (
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-xs font-semibold text-stone-500 mb-2">Live session feed</p>
          <ul className="space-y-2">
            {feed.slice(0, 4).map((f) => (
              <li key={f.id} className="text-sm text-stone-700 flex justify-between gap-2">
                <span>{f.event}</span>
                <span className="text-stone-400 shrink-0">{f.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
