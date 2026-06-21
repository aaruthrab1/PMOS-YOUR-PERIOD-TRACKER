import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useAndrogenLogs } from './useAndrogenLogs';
import { usePeriodLogs } from './usePeriodLogs';
import { useMoodLogs } from './useMoodLogs';
import { computeCycleForecast } from '@/lib/dashboard/cycleForecast';
import { analyzeAndrogenLogs } from '@/lib/androgen/analytics';
import { computeAndrogenIntelligence } from '@/lib/androgen/intelligenceAnalytics';
import { generateIntelligenceInsights } from '@/lib/androgen/intelligenceInsights';

export function useAndrogenTracker() {
  const { preferences } = useAuth();
  const { simpleLanguage, setSimpleLanguage } = usePersonalization();
  const androgen = useAndrogenLogs({ limit: 52 });
  const periods = usePeriodLogs({ limit: 36 });
  const mood = useMoodLogs({ limit: 90 });

  const cycle = useMemo(
    () => computeCycleForecast(periods.data, preferences, null),
    [periods.data, preferences],
  );

  const analytics = useMemo(
    () => analyzeAndrogenLogs(androgen.data, periods.data, cycle.cycleLength, simpleLanguage),
    [androgen.data, periods.data, cycle.cycleLength, simpleLanguage],
  );

  const intelligence = useMemo(
    () => computeAndrogenIntelligence(analytics, mood.data, periods.data),
    [analytics, mood.data, periods.data],
  );

  const insights = useMemo(
    () => generateIntelligenceInsights(analytics, intelligence, periods.data, mood.data),
    [analytics, intelligence, periods.data, mood.data],
  );

  return {
    logs: androgen.data,
    upsert: androgen.upsert,
    loading: androgen.loading || periods.loading || mood.loading,
    fromCache: androgen.fromCache,
    error: androgen.error,
    cycle,
    analytics,
    intelligence,
    insights,
    simpleLanguage,
    setSimpleLanguage,
    refresh: androgen.refresh,
  };
}
