import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, fraudApi } from '../services/api';
import { useGlobalRiskFeed } from '../context/RiskFeedContext';
import { useSocket } from '../context/SocketContext';
import { getErrorMessage, riskLabel, formatDate } from '../utils/helpers';
import RiskFeed from './ui/RiskFeed';
import RiskEscalationTimeline from './ui/RiskEscalationTimeline';
import LoadingState from './ui/LoadingState';
import EmptyState from './ui/EmptyState';

export default function DashboardView() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { feed, setFeed } = useGlobalRiskFeed();
  const socket = useSocket();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, historyRes] = await Promise.all([
        dashboardApi.stats(),
        fraudApi.history(15),
      ]);

      const data = statsRes?.data?.data ?? null;
      setStats(data);

      const hist = (historyRes?.data?.data || []).map((t) => ({
        id: t?.id || t?._id,
        timestamp: t?.createdAt ? formatDate(t.createdAt) : '—',
        amount: t?.amount ?? 0,
        location: t?.location ?? '—',
        riskScore: t?.riskScore ?? 0,
        riskLevel: t?.riskLevel ?? 'low',
        humanSummary: t?.humanSummary,
      }));
      setTransactions(hist);

      const logs = data?.escalationLogs ?? data?.riskHistory ?? [];
      const fromApi = logs.slice(0, 10).map((e, i) => {
        const last = e?.escalationTimeline?.[e.escalationTimeline?.length - 1];
        return {
          id: `init-${e?.id || i}`,
          time: last?.time || '',
          event: last?.event || e?.humanSummary || e?.signals?.[0] || 'Risk event',
          riskAfter: e?.finalRisk ?? last?.riskAfter,
          type: e?.sourceType || 'fraud',
          riskLevel: e?.riskLevel,
        };
      });
      if (fromApi.length) setFeed(fromApi);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setFeed]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => fetchDashboard();

    socket.on('analysis:complete', refresh);
    socket.on('risk:escalation', refresh);
    socket.on('fraud:alert', refresh);
    socket.on('scam:alert', refresh);

    return () => {
      socket.off('analysis:complete', refresh);
      socket.off('risk:escalation', refresh);
      socket.off('fraud:alert', refresh);
      socket.off('scam:alert', refresh);
    };
  }, [socket, fetchDashboard]);

  const fraud = stats?.fraud ?? stats?.summary?.fraud ?? {};
  const scam = stats?.scam ?? stats?.summary?.scam ?? {};
  const recentAnalyses = stats?.recentAnalyses ?? [];
  const latestEscalation = stats?.escalationLogs?.[0]?.escalationTimeline ?? [];

  const filteredTx = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        String(t?.id ?? '').toLowerCase().includes(q) ||
        String(t?.location ?? '').toLowerCase().includes(q) ||
        String(t?.riskLevel ?? '').toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  if (loading && !stats) {
    return <LoadingState message="Loading your protection overview…" />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Overview</h1>
          <p className="text-sm text-stone-500 mt-1">Live updates when fraud or scam checks complete.</p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
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
          { label: 'Transactions reviewed', value: fraud?.total ?? 0, sub: `${fraud?.cleared ?? 0} cleared` },
          { label: 'Messages scanned', value: scam?.total ?? 0, sub: `${scam?.safe ?? 0} low risk` },
          { label: 'Average risk', value: `${fraud?.avgRiskScore ?? 0}%`, sub: 'Across transactions' },
          { label: 'Needs attention', value: fraud?.flagged ?? 0, sub: 'Flagged items' },
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
          {!recentAnalyses?.length ? (
            <EmptyState
              icon="analytics"
              title="No analyses yet"
              description="No suspicious activity detected yet—that's a good sign. Run a check to see results here."
              action={
                <Link to="/fraud-detection" className="text-sm font-semibold text-teal-700 hover:underline">
                  Check a transaction
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {recentAnalyses.slice(0, 6).map((a) => (
                <li
                  key={`${a?.type}-${a?.id}`}
                  className="flex justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-500 capitalize">
                      {a?.type ?? 'event'} · {a?.createdAt ? formatDate(a.createdAt) : ''}
                    </p>
                    <p className="text-sm text-stone-800 mt-0.5 truncate">
                      {a?.summary || a?.recommendation || 'Analysis recorded'}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-stone-700 shrink-0">{a?.riskScore ?? 0}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="lg:col-span-5">
          <RiskFeed
            items={feed}
            title="Live risk activity"
            emptyMessage="Nothing flagged yet today. That's a good sign—we'll post updates here instantly when you run a check."
          />
        </aside>
      </div>

      {latestEscalation?.length > 0 && (
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
            placeholder="Search…"
            className="form-input max-w-xs text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[500px]">
            <thead>
              <tr className="bg-stone-50 text-xs uppercase text-stone-500">
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {!filteredTx?.length ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-stone-500">
                    No transactions to show yet.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx, i) => (
                  <tr key={tx.id} className="hover:bg-stone-50/80 animate-step-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="px-5 py-3 text-stone-600">{tx.timestamp}</td>
                    <td className="px-5 py-3 font-medium">${Number(tx.amount).toLocaleString()}</td>
                    <td className="px-5 py-3">{tx.location}</td>
                    <td className="px-5 py-3">
                      {tx.riskScore}% · {riskLabel(tx.riskLevel)}
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
