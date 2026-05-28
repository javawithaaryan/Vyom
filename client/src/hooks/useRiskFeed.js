import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

function mapEscalationToFeedItem(data) {
  const lastStep = data.escalationTimeline?.[data.escalationTimeline.length - 1];
  const event =
    lastStep?.event ||
    data.humanSummary ||
    data.signals?.[0] ||
    (data.type === 'scam' ? 'Message risk updated' : 'Transaction risk updated');

  return {
    id: `${data.type}-${data.transactionId || data.messageId || Date.now()}`,
    time: lastStep?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event,
    riskScore: data.riskScore,
    riskLevel: data.riskLevel,
    type: data.type || 'fraud',
    riskAfter: lastStep?.riskAfter,
  };
}

export function useRiskFeed(initialItems = []) {
  const socket = useSocket();
  const [feed, setFeed] = useState(initialItems);

  const pushFeed = useCallback((item) => {
    setFeed((prev) => [item, ...prev].slice(0, 12));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onEscalation = (data) => {
      pushFeed(mapEscalationToFeedItem({ ...data, type: data.type || 'fraud' }));
    };

    const onFraud = (data) => pushFeed(mapEscalationToFeedItem({ ...data, type: 'fraud' }));
    const onScam = (data) => pushFeed(mapEscalationToFeedItem({ ...data, type: 'scam' }));

    socket.on('risk:escalation', onEscalation);
    socket.on('fraud:alert', onFraud);
    socket.on('scam:alert', onScam);

    return () => {
      socket.off('risk:escalation', onEscalation);
      socket.off('fraud:alert', onFraud);
      socket.off('scam:alert', onScam);
    };
  }, [socket, pushFeed]);

  return { feed, pushFeed, setFeed };
}

export function useLiveEscalation(timeline, playing) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (!playing || !timeline?.length) {
      setVisible(timeline || []);
      return;
    }

    setVisible([]);
    let i = 0;
    const tick = () => {
      if (i < timeline.length) {
        setVisible((prev) => [...prev, timeline[i]]);
        i += 1;
      }
    };
    tick();
    const id = setInterval(tick, 550);
    return () => clearInterval(id);
  }, [timeline, playing]);

  return visible;
}
