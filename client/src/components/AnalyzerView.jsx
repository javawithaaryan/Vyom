import { useState } from 'react';
import { fraudApi } from '../services/api';
import { useGlobalRiskFeed } from '../context/RiskFeedContext';
import { useStreamingAnalysis } from '../hooks/useStreamingAnalysis';
import { getErrorMessage } from '../utils/helpers';
import { FRAUD_DEMO_PRESETS } from '../data/demoPresets';
import AnalysisPanel from './ui/AnalysisPanel';
import RiskFeed from './ui/RiskFeed';

const THINKING_STEPS = [
  'Analyzing transaction…',
  'Checking behavior patterns…',
  'Cross-checking device trust…',
  'Reviewing location signals…',
  'Calculating risk escalation…',
];

export default function AnalyzerView() {
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [device, setDevice] = useState('');
  const [merchantCategory, setMerchantCategory] = useState('');
  const [formError, setFormError] = useState('');

  const { pushFeed } = useGlobalRiskFeed();

  const stream = useStreamingAnalysis({
    thinkingSteps: THINKING_STEPS,
    baseRisk: 24,
    minDurationMs: 5000,
  });

  const applyPreset = (preset) => {
    setAmount(preset.data.amount);
    setLocation(preset.data.location);
    setDevice(preset.data.device);
    setMerchantCategory(preset.data.merchantCategory || '');
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!amount?.trim() || !location?.trim() || !device?.trim()) {
      setFormError('Please add amount, location, and device details.');
      return;
    }
    setFormError('');

    try {
      const data = await stream.run(() =>
        fraudApi.analyze({
          amount: parseFloat(amount),
          location,
          device,
          merchantCategory: merchantCategory || 'unknown',
        })
      );

      if (data) {
        pushFeed({
          id: `local-fraud-${data.id}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event:
            data.escalationTimeline?.[data.escalationTimeline.length - 1]?.event ||
            'Transaction reviewed',
          riskAfter: data.riskScore,
          riskLevel: data.riskLevel,
          type: 'fraud',
        });
      }
    } catch (err) {
      setFormError(getErrorMessage(err) || "We couldn't complete this check.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Transaction check</h1>
        <p className="text-sm text-stone-500 mt-1">
          Watch risk build live—signals appear one by one over a few seconds.
        </p>
      </header>

      <section className="glass-card p-4 rounded-2xl">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Demo scenarios</p>
        <div className="flex flex-wrap gap-2">
          {FRAUD_DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={stream.isRunning}
              onClick={() => applyPreset(p)}
              className="text-left text-xs font-medium px-3 py-2 rounded-lg bg-stone-100 hover:bg-teal-50 border border-stone-200 min-h-[44px] disabled:opacity-50"
              title={p.description}
            >
              {p.title}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 glass-card p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-stone-800 mb-4">Transaction details</h2>
          {(formError || stream.error) && (
            <div className="alert alert-error mb-4" role="alert">
              {formError || stream.error}
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount (USD)</label>
              <input
                id="amount"
                type="number"
                min="0"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="location">Location</label>
              <input
                id="location"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="device">Device / network</label>
              <input
                id="device"
                className="form-input"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="merchant">Merchant (optional)</label>
              <input
                id="merchant"
                className="form-input"
                value={merchantCategory}
                onChange={(e) => setMerchantCategory(e.target.value)}
              />
            </div>
            <button type="submit" className="form-btn w-full" disabled={stream.isRunning}>
              {stream.isRunning ? 'Review in progress…' : 'Check this transaction'}
            </button>
          </form>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl min-h-[320px]">
            <AnalysisPanel
              isRunning={stream.isRunning}
              phase={stream.phase}
              thinkingMessage={stream.thinkingMessage}
              currentRisk={stream.currentRisk}
              visibleTimeline={stream.visibleTimeline}
              signalSteps={stream.signalSteps}
              result={stream.result}
              emptyMessage="Submit a transaction or pick a demo scenario to start live analysis."
            />
          </div>
          <RiskFeed title="Live risk activity" />
        </section>
      </div>
    </div>
  );
}
