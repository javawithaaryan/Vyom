import { useState, useEffect } from 'react';
import { scamApi } from '../services/api';
import { useGlobalRiskFeed } from '../context/RiskFeedContext';
import { useStreamingAnalysis } from '../hooks/useStreamingAnalysis';
import { getErrorMessage, riskLabel } from '../utils/helpers';
import { SCAM_DEMO_PRESETS } from '../data/demoPresets';
import AnalysisPanel from './ui/AnalysisPanel';
import HighlightedMessage from './ui/HighlightedMessage';
import EmptyState from './ui/EmptyState';
import LoadingState from './ui/LoadingState';
import RiskFeed from './ui/RiskFeed';

const THINKING_STEPS = [
  'Scanning message…',
  'Analyzing urgency language…',
  'Cross-checking phishing patterns…',
  'Evaluating payment pressure…',
  'Building risk timeline…',
];

function mapHistoryItem(h) {
  if (!h) return null;
  return {
    id: h.id || h._id,
    body: h.content || '',
    receivedOn: h.createdAt ? new Date(h.createdAt).toLocaleString() : '',
    riskScore: h.riskScore ?? null,
    riskLevel: h.riskLevel,
    humanSummary: h.humanSummary,
    signals: h.signals || [],
    highlightedPhrases: h.highlightedPhrases || [],
    escalationTimeline: h.escalationTimeline || [],
    signalDetails: h.signalDetails || [],
    recommendation: h.recommendation,
    aiReasoning: h.aiReasoning,
    confidenceExplanation: h.confidenceExplanation,
    confidencePercent:
      h.confidencePercent ?? (h.aiConfidence != null ? Math.round(h.aiConfidence * 100) : null),
    analyzed: h.riskScore != null,
  };
}

export default function InboxView() {
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [customBody, setCustomBody] = useState('');
  const [customSender, setCustomSender] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [panelResult, setPanelResult] = useState(null);
  const [error, setError] = useState('');

  const { pushFeed } = useGlobalRiskFeed();

  const stream = useStreamingAnalysis({
    thinkingSteps: THINKING_STEPS,
    baseRisk: 12,
    minDurationMs: 5200,
  });

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await scamApi.history(25);
      const list = (res?.data?.data || []).map(mapHistoryItem).filter(Boolean);
      setMessages(list);
      if (list.length && !activeId) setActiveId(list[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const active = messages.find((m) => m?.id === activeId) || messages[0] || null;
  const filtered = messages.filter((m) => m?.body?.toLowerCase().includes(search.toLowerCase()));

  const runAnalyze = async (content) => {
    setError('');
    setPanelResult(null);

    try {
      const data = await stream.run(() => scamApi.analyze({ content }));
      if (!data) return null;

      const mapped = mapHistoryItem({ ...data, content });
      setPanelResult(mapped);
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== mapped.id);
        return [mapped, ...without];
      });
      setActiveId(mapped.id);

      pushFeed({
        id: `local-scam-${mapped.id}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event:
          mapped.escalationTimeline?.[mapped.escalationTimeline.length - 1]?.event ||
          'Message analyzed',
        riskAfter: mapped.riskScore,
        riskLevel: mapped.riskLevel,
        type: 'scam',
      });
      return mapped;
    } catch (err) {
      setError(getErrorMessage(err) || "We couldn't scan this message.");
      return null;
    }
  };

  const loadDemo = async (preset) => {
    setCustomOpen(false);
    setCustomBody(preset.content);
    await runAnalyze(preset.content);
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customBody?.trim()) return;
    const content = `From: ${customSender}\nSubject: ${customSubject}\n\n${customBody}`;
    const ok = await runAnalyze(content);
    if (ok) {
      setCustomOpen(false);
      setCustomSender('');
      setCustomSubject('');
      setCustomBody('');
    }
  };

  const displayResult = stream.result ? mapHistoryItem({ ...stream.result, content: active?.body }) : panelResult;

  if (loadingHistory && !messages.length) {
    return <LoadingState message="Loading message history…" />;
  }

  return (
    <div className="space-y-4 max-w-7xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Message check</h1>
        <p className="text-sm text-stone-500 mt-1">
          Urgency and phishing language are highlighted as risk escalates—same live flow as transactions.
        </p>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <section className="glass-card p-4 rounded-2xl">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Demo scenarios</p>
        <div className="flex flex-wrap gap-2">
          {SCAM_DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={stream.isRunning}
              onClick={() => loadDemo(p)}
              className="text-xs font-medium px-3 py-2 rounded-lg bg-stone-100 hover:bg-teal-50 border border-stone-200 min-h-[44px] disabled:opacity-50"
            >
              {p.title}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <aside className="xl:col-span-3 glass-card rounded-2xl flex flex-col max-h-[520px]">
          <div className="p-4 border-b border-stone-100 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold">History</h2>
              <button
                type="button"
                onClick={() => setCustomOpen(!customOpen)}
                className="text-xs font-semibold text-teal-700 min-h-[44px] px-2"
              >
                {customOpen ? 'Cancel' : 'New scan'}
              </button>
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="form-input text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {customOpen ? (
              <form onSubmit={handleCustomSubmit} className="p-2 space-y-2">
                <textarea
                  className="form-input text-sm resize-none"
                  rows={6}
                  required
                  placeholder="Paste message…"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                />
                <button type="submit" className="form-btn w-full text-sm" disabled={stream.isRunning}>
                  {stream.isRunning ? 'Scanning…' : 'Scan message'}
                </button>
              </form>
            ) : filtered.length === 0 ? (
              <EmptyState icon="mail" title="No messages yet" description="Run a demo or paste a message to scan." />
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveId(m.id);
                    setPanelResult(m);
                  }}
                  className={`w-full text-left p-3 rounded-xl mb-2 min-h-[44px] ${
                    active?.id === m.id ? 'bg-teal-50 border border-teal-200' : 'hover:bg-stone-50'
                  }`}
                >
                  <p className="text-xs text-stone-500">{m.receivedOn}</p>
                  <p className="text-sm line-clamp-2 mt-1">{m.body}</p>
                  {m.analyzed && (
                    <p className="text-xs font-semibold text-teal-800 mt-1">
                      {m.riskScore}% · {riskLabel(m.riskLevel)}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="xl:col-span-5 glass-card p-5 rounded-2xl min-h-[280px]">
          {!active ? (
            <EmptyState icon="mark_email_unread" title="Select a message" description="Choose from history or run a demo." />
          ) : (
            <>
              <p className="text-xs text-stone-500 mb-3">{active.receivedOn}</p>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                <HighlightedMessage
                  text={active.body}
                  phrases={displayResult?.highlightedPhrases || active.highlightedPhrases}
                />
              </div>
              {!active.analyzed && !stream.isRunning && (
                <button
                  type="button"
                  onClick={() => runAnalyze(active.body)}
                  className="form-btn mt-4"
                >
                  Analyze this message
                </button>
              )}
            </>
          )}
        </section>

        <aside className="xl:col-span-4 space-y-4">
          <div className="glass-card p-5 rounded-2xl min-h-[280px]">
            <h2 className="text-sm font-semibold text-stone-800 mb-4">Live analysis</h2>
            <AnalysisPanel
              isRunning={stream.isRunning}
              phase={stream.phase}
              thinkingMessage={stream.thinkingMessage}
              currentRisk={stream.currentRisk}
              visibleTimeline={stream.visibleTimeline}
              signalSteps={stream.signalSteps}
              result={displayResult}
              emptyMessage="Run a demo or scan a message to see escalation."
            />
          </div>
          <RiskFeed title="Live risk activity" />
        </aside>
      </div>
    </div>
  );
}
