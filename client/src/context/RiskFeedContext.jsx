import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

const RiskFeedContext = createContext(null);

function mapToFeedItem(data) {
  const last = data?.escalationTimeline?.[data.escalationTimeline.length - 1];
  return {
    id: `${data?.type || 'event'}-${data?.transactionId || data?.messageId || Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: last?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event: last?.event || data?.humanSummary || data?.signals?.[0] || 'Risk updated',
    riskScore: data?.riskScore,
    riskLevel: data?.riskLevel,
    type: data?.type || 'fraud',
    riskAfter: last?.riskAfter ?? data?.riskScore,
  };
}

export function RiskFeedProvider({ children }) {
  const socket = useSocket();
  const [feed, setFeed] = useState([]);

  const pushFeed = useCallback((item) => {
    setFeed((prev) => {
      const deduped = prev.filter((p) => p.id !== item.id);
      return [item, ...deduped].slice(0, 20);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onEvent = (data) => {
      pushFeed(mapToFeedItem(data));
    };

    socket.on('analysis:complete', onEvent);

    return () => {
      socket.off('analysis:complete', onEvent);
    };
  }, [socket, pushFeed]);

  return (
    <RiskFeedContext.Provider value={{ feed, pushFeed, setFeed }}>
      {children}
    </RiskFeedContext.Provider>
  );
}

export function useGlobalRiskFeed() {
  const ctx = useContext(RiskFeedContext);
  if (!ctx) throw new Error('useGlobalRiskFeed requires RiskFeedProvider');
  return ctx;
}
