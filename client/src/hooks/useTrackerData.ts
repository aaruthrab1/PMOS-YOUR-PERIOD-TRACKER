import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { usePeriodLogs } from './usePeriodLogs';
import { useSleepLogs } from './useSleepLogs';
import { useWeightLogs } from './useWeightLogs';
import { useMoodLogs } from './useMoodLogs';
import { useMetabolicLogs } from './useMetabolicLogs';
import { computeCycleForecast } from '@/lib/dashboard/cycleForecast';
import { analyzePeriodData } from '@/lib/tracker/periodAnalytics';
import { analyzeSleepData } from '@/lib/tracker/sleepAnalytics';
import { analyzeWeightData } from '@/lib/tracker/weightAnalytics';
import { analyzeMoodData } from '@/lib/tracker/moodAnalytics';
import { analyzeMetabolicData } from '@/lib/tracker/metabolicAnalytics';
import { personalizeTrackerInsights } from '@/lib/personalization';
import { generateTrackerInsights } from '@/lib/tracker/aiInsights';

const LOG_LIMIT = 180;

export function useTrackerData() {
  const { profile, preferences } = useAuth();
  const { smartContext } = usePersonalization();
  const periods = usePeriodLogs({ limit: 36 });
  const sleep = useSleepLogs({ limit: LOG_LIMIT });
  const weight = useWeightLogs({ limit: LOG_LIMIT });
  const mood = useMoodLogs({ limit: LOG_LIMIT });
  const metabolic = useMetabolicLogs({ limit: LOG_LIMIT });

  const loading =
    periods.loading || sleep.loading || weight.loading || mood.loading || metabolic.loading;

  const fromCache =
    periods.fromCache || sleep.fromCache || weight.fromCache || mood.fromCache || metabolic.fromCache;

  const error =
    periods.error || sleep.error || weight.error || mood.error || metabolic.error;

  const cycle = useMemo(
    () => computeCycleForecast(periods.data, preferences, profile),
    [periods.data, preferences, profile],
  );

  const periodAnalytics = useMemo(
    () => analyzePeriodData(periods.data, cycle, preferences),
    [periods.data, cycle, preferences],
  );

  const sleepAnalytics = useMemo(
    () => analyzeSleepData(sleep.data),
    [sleep.data],
  );

  const weightAnalytics = useMemo(
    () => analyzeWeightData(weight.data),
    [weight.data],
  );

  const moodAnalytics = useMemo(
    () => analyzeMoodData(mood.data, periods.data, cycle),
    [mood.data, periods.data, cycle],
  );

  const metabolicAnalytics = useMemo(
    () => analyzeMetabolicData(metabolic.data, sleep.data, cycle),
    [metabolic.data, sleep.data, cycle],
  );

  const insights = useMemo(
    () =>
      personalizeTrackerInsights(
        generateTrackerInsights({
          profile,
          cycle,
          periodAnalytics,
          sleepAnalytics,
          weightAnalytics,
          moodAnalytics,
          metabolicAnalytics,
        }),
        smartContext,
      ),
    [profile, cycle, periodAnalytics, sleepAnalytics, weightAnalytics, moodAnalytics, metabolicAnalytics, smartContext],
  );

  const refreshAll = async () => {
    await Promise.all([
      periods.refresh(),
      sleep.refresh(),
      weight.refresh(),
      mood.refresh(),
      metabolic.refresh(),
    ]);
  };

  return {
    profile,
    preferences,
    periods: periods.data,
    sleepLogs: sleep.data,
    weightLogs: weight.data,
    moodLogs: mood.data,
    metabolicLogs: metabolic.data,
    cycle,
    periodAnalytics,
    sleepAnalytics,
    weightAnalytics,
    moodAnalytics,
    metabolicAnalytics,
    insights,
    loading,
    fromCache,
    error,
    refreshAll,
    periodActions: periods,
    sleepActions: sleep,
    weightActions: weight,
    moodActions: mood,
    metabolicActions: metabolic,
  };
}
