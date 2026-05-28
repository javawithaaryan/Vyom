import { useState } from 'react';
import { fraudApi } from '../services/api';
import { useRiskFeed } from '../hooks/useRiskFeed';
import { getErrorMessage, riskLabel } from '../utils/helpers';
import RiskEscalationTimeline from './ui/RiskEscalationTimeline';
import RiskFeed from './ui/RiskFeed';

const PRESETS = [
  {
    title: 'High-risk travel',
    data: { amount: '5320', location: 'Moscow, RU', device: 'new device / VPN proxy' },
  },
  {
    title: 'Everyday purchase',
    data: { amount: '89', location: 'Sydney, AU', device: 'Chrome / Windows / home network' },
  },
];

export default function AnalyzerView() {
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [device, setDevice] = useState('');
  const [merchantCategory, setMerchantCategory] = useState('');

  const [result, setResult] = useState(null);
  const [animateTimeline, setAnimateTimeline] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const { feed, pushFeed } = useRiskFeed([]);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!amount || !location || !device) {
      setError('Please add amount, location, and device details so we can review this fairly.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);
    setAnimateTimeline(false);

    try {
      const res = await fraudApi.analyze({
        amount: parseFloat(amount),
        location,
        device,
        merchantCategory: merchantCategory || 'unknown',
      });
      const data = res.data.data;

      setResult(data);
      setAnimateTimeline(true);

      pushFeed({
        id: `local-${data.id}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: data.escalationTimeline?.[data.escalationTimeline.length - 1]?.event || 'Transaction reviewed',
        riskAfter: data.riskScore,
        riskLevel: data.riskLevel,
        type: 'fraud',
      });
    } catch (err) {
      setError(getErrorMessage(err) || "We couldn't complete this check. Try again in a moment.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Transaction check</h1>
        <p className="text-sm text-stone-500 mt-1">
          We build risk step by step—watch how each signal changes the score.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 glass-card p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-stone-800 mb-4">Transaction details</h2>

          {error && <div className="alert alert-error mb-4" role="alert">{error}</div>}

          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => {
                  setAmount(p.data.amount);
                  setLocation(p.data.location);
                  setDevice(p.data.device);
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-teal-50 hover:text-teal-900 min-h-[44px]"
              >
                {p.title}
              </button>
            ))}
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount (USD)</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="location">Location</label>
              <input
                id="location"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, country"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="device">Device / network</label>
              <input
                id="device"
                className="form-input"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                placeholder="Browser, OS, VPN, etc."
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="merchant">Merchant (optional)</label>
              <input
                id="merchant"
                className="form-input"
                value={merchantCategory}
                onChange={(e) => setMerchantCategory(e.target.value)}
                placeholder="e.g. grocery, crypto"
              />
            </div>
            <button type="submit" className="form-btn w-full" disabled={analyzing}>
              {analyzing ? (
                <>
                  <span className="spinner mr-2" />
                  Reviewing signals…
                </>
              ) : (
                'Check this transaction'
              )}
            </button>
          </form>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            {analyzing && !result && (
              <div className="py-8 text-center">
                <div className="spinner spinner-lg mx-auto mb-3" />
                <p className="text-sm text-stone-600 animate-pulse-soft">
                  Comparing amount, location, and device patterns…
                </p>
              </div>
            )}

            {!analyzing && !result && (
              <p className="text-sm text-stone-500 py-6">
                Submit a transaction to see live risk escalation and a plain-language summary.
              </p>
            )}

            {result && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-medium text-stone-500">Risk score</p>
                    <p className="text-4xl font-bold text-stone-900">{result.riskScore}%</p>
                    <p className="text-sm text-stone-600 mt-1">{riskLabel(result.riskLevel)}</p>
                  </div>
                  {result.confidencePercent != null && (
                    <div className="text-right">
                      <p className="text-xs font-medium text-stone-500">Confidence</p>
                      <p className="text-xl font-semibold text-teal-800">{result.confidencePercent}%</p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-stone-700 leading-relaxed mb-4">
                  {result.humanSummary || result.recommendation}
                </p>

                {result.aiReasoning?.whyIncreased && (
                  <p className="text-sm text-stone-600 bg-stone-50 border border-stone-100 rounded-lg p-3 mb-4">
                    {result.aiReasoning.whyIncreased}
                  </p>
                )}

                {result.confidenceExplanation && (
                  <p className="text-xs text-stone-500 mb-4 italic">{result.confidenceExplanation}</p>
                )}

                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-3">
                  Risk escalation
                </h3>
                <RiskEscalationTimeline
                  timeline={result.escalationTimeline}
                  animate={animateTimeline}
                />

                {result.signals?.length > 0 && (
                  <ul className="mt-6 space-y-2 border-t border-stone-100 pt-4">
                    {result.signals.map((s, i) => (
                      <li key={i} className="text-sm text-stone-700 flex gap-2">
                        <span className="text-teal-600">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-4 text-sm font-medium text-teal-900 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                  {result.recommendation}
                </p>
              </>
            )}
          </div>

          <RiskFeed
            items={feed}
            title="Session activity"
            emptyMessage="Escalation updates from this session will appear here."
          />
        </section>
      </div>
    </div>
  );
}
