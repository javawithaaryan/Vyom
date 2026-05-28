import { useCallback, useRef, useState } from 'react';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Progressive "AI thinking" + staged escalation replay (4–6s total feel).
 */
export function useStreamingAnalysis({ thinkingSteps = [], baseRisk = 24, minDurationMs = 4800 }) {
  const [isRunning, setIsRunning] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | thinking | revealing | done
  const [visibleTimeline, setVisibleTimeline] = useState([]);
  const [signalSteps, setSignalSteps] = useState([]);
  const [currentRisk, setCurrentRisk] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const cancelRef = useRef(false);

  const reset = useCallback(() => {
    setVisibleTimeline([]);
    setSignalSteps([]);
    setCurrentRisk(0);
    setResult(null);
    setError('');
    setPhase('idle');
    setThinkingIndex(0);
  }, []);

  const run = useCallback(
    async (apiCall) => {
      cancelRef.current = false;
      reset();
      setIsRunning(true);
      setPhase('thinking');
      setCurrentRisk(baseRisk);

      const started = Date.now();
      let tick = 0;
      const thinkTimer = setInterval(() => {
        tick += 1;
        setThinkingIndex((i) => (i + 1) % Math.max(thinkingSteps.length, 1));
      }, 850);

      let data;
      try {
        const res = await apiCall();
        data = res?.data?.data ?? res?.data ?? res;
      } catch (err) {
        clearInterval(thinkTimer);
        setIsRunning(false);
        setPhase('idle');
        setError(err?.response?.data?.message || err?.message || 'Analysis failed');
        throw err;
      }

      const elapsed = Date.now() - started;
      const pad = Math.max(0, minDurationMs - elapsed);
      await delay(pad);

      if (cancelRef.current) return null;

      clearInterval(thinkTimer);
      setPhase('revealing');

      const timeline = Array.isArray(data?.escalationTimeline) ? data.escalationTimeline : [];
      const details = Array.isArray(data?.signalDetails) ? data.signalDetails : [];

      let prevRisk = baseRisk;
      for (let i = 0; i < timeline.length; i++) {
        if (cancelRef.current) break;
        await delay(i === 0 ? 400 : 750);
        const step = timeline[i];
        setVisibleTimeline((prev) => [...prev, step]);
        const after = step?.riskAfter ?? prevRisk;
        setCurrentRisk(after);

        if (i > 0) {
          const detail = details[i - 1] || details[i - 2];
          const delta = detail?.weight ?? Math.max(0, after - prevRisk);
          if (detail || delta > 0) {
            setSignalSteps((prev) => [
              ...prev,
              {
                label: detail?.label || step?.event || 'Signal detected',
                delta,
                riskAfter: after,
              },
            ]);
          }
        }
        prevRisk = after;
      }

      if (!timeline.length && data?.riskScore != null) {
        setCurrentRisk(data.riskScore);
      }

      setResult(data);
      setPhase('done');
      setIsRunning(false);
      return data;
    },
    [baseRisk, minDurationMs, reset, thinkingSteps.length]
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setPhase('idle');
  }, []);

  const thinkingMessage =
    thinkingSteps[thinkingIndex] || thinkingSteps[0] || 'Analyzing…';

  return {
    run,
    cancel,
    reset,
    isRunning,
    phase,
    thinkingMessage,
    visibleTimeline,
    signalSteps,
    currentRisk,
    result,
    error,
  };
}
