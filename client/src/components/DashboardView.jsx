import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, fraudApi } from '../services/api';
import { useRiskFeed } from '../hooks/useRiskFeed';
import { getErrorMessage, riskLabel, formatDate } from '../utils/helpers';
import RiskFeed from './ui/RiskFeed';
import RiskEscalationTimeline from './ui/RiskEscalationTimeline';
import PageLoader from './ui/PageLoader';
import EmptyState from './ui/EmptyState';

export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { feed, setFeed } = useRiskFeed([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, historyRes] = await Promise.all([
        dashboardApi.stats(),
        fraudApi.history(15),
      ]);
      const data = statsRes.data.data;
      setStats(data);

      const hist = (historyRes.data.data || []).map((t) => ({
        id: t.id || t._id,
        timestamp: formatDate(t.createdAt),
        amount: t.amount,
        location: t.location,
        riskScore: t.riskScore,
        riskLevel: t.riskLevel,
        signals: t.signals,
        humanSummary: t.humanSummary,
      }));
      setTransactions(hist);

      const fromApi = (data.escalationLogs || data.riskHistory || []).slice(0, 8).map((e, i) => {
        const last = e.escalationTimeline?.[e.escalationTimeline.length - 1];
        return {
          id: `init-${e.id || i}`,
          time: last?.time || formatDate(e.createdAt).split(',')[1]?.trim() || '',
          event: last?.event || e.humanSummary || e.signals?.[0] || 'Risk event recorded',
          riskAfter: e.finalRisk ?? last?.riskAfter,
          type: e.sourceType,
          riskLevel: e.riskLevel,
        };
      });
      if (fromApi.length) setFeed(fromApi);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fraud = stats?.fraud || stats?.summary?.fraud || { total: 0, flagged: 0, avgRiskScore: 0 };
  const scam = stats?.scam || stats?.summary?.scam || { total: 0, flagged: 0 };
  const recentAnalyses = stats?.recentAnalyses || [];
  const latestEscalation = stats?.escalationLogs?.[0]?.escalationTimeline || [];

  const filteredTx = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        String(t.id).toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        t.riskLevel?.includes(q)
    );
  }, [transactions, searchQuery]);

  if (loading && !stats) {
    return <PageLoader message="Loading your protection overview…" />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Overview</h1>
          <p className="text-sm text-stone-500 mt-1">
            Real activity from your analyses—no placeholder metrics.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          Monitoring active
        </span>
      </header>

      {error && (
        <div className="alert alert-error flex justify-between gap-2" role="alert">
          <span>{error}</span>
          <button type="button" className="underline text-sm font-semibold" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Transactions reviewed', value: fraud.total, sub: `${fraud.cleared ?? fraud.total - fraud.flagged} cleared` },
          { label: 'Messages scanned', value: scam.total, sub: `${scam.safe ?? scam.total - scam.flagged} low risk` },
          { label: 'Average risk score', value: `${fraud.avgRiskScore}%`, sub: 'Across transactions' },
          { label: 'Needs attention', value: fraud.flagged, sub: 'Flagged for review' },
        ].map((card) => (
          <div key={card.label} className="glass-card p-5 rounded-2xl">
            <p className="text-xs font-medium text-stone-500">{card.label}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">{card.value}</p>
            <p className="text-xs text-stone-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 glass-card p-6 rounded-2xl">
          <h2 className="text-base font-semibold text-stone-900 mb-4">Recent analyses</h2>
          {recentAnalyses.length === 0 ? (
            <EmptyState
              icon="analytics"
              title="No analyses yet"
              description="Run a transaction or message check—we'll list results here with real timestamps."
              action={
                <Link
                  to="/fraud-detection"
                  className="text-sm font-semibold text-teal-700 hover:underline"
                >
                  Check a transaction
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {recentAnalyses.slice(0, 6).map((a) => (
                <li
                  key={`${a.type}-${a.id}`}
                  className="flex justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-500 capitalize">{a.type} · {formatDate(a.createdAt)}</p>
                    <p className="text-sm text-stone-800 mt-0.5 truncate">{a.summary || a.recommendation}</p>
                  </div>
                  <span className="text-sm font-bold text-stone-700 shrink-0">{a.riskScore}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="lg:col-span-5">
          <RiskFeed items={feed} />
        </aside>
      </div>

      {latestEscalation.length > 0 && (
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-semibold text-stone-900 mb-4">Latest escalation path</h2>
          <RiskEscalationTimeline timeline={latestEscalation} animate={false} />
        </section>
      )}

      <section className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-stone-900">Transaction history</h2>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location or id…"
            className="form-input max-w-xs text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className="bg-stone-50 text-xs uppercase text-stone-500">
                <th className="px-5 py-3 font-semibold">When</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-stone-500">
                    No suspicious activity in this list. That can be a good sign.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/80">
                    <td className="px-5 py-3 text-stone-600">{tx.timestamp}</td>
                    <td className="px-5 py-3 font-medium">${Number(tx.amount).toLocaleString()}</td>
                    <td className="px-5 py-3">{tx.location}</td>
                    <td className="px-5 py-3">
                      <span className="font-semibold">{tx.riskScore}%</span>
                      <span className="text-stone-500 ml-1">· {riskLabel(tx.riskLevel)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
