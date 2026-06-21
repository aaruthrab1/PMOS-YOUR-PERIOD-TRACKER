import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePeriodLogs } from '@/hooks/usePeriodLogs';
import { useMoodLogs } from '@/hooks/useMoodLogs';
import { useSleepLogs } from '@/hooks/useSleepLogs';
import { useMetabolicLogs } from '@/hooks/useMetabolicLogs';
import { useAndrogenLogs } from '@/hooks/useAndrogenLogs';
import { listQuizResults } from '@/lib/db/quizResults';
import { computeCycleForecast } from '@/lib/dashboard/cycleForecast';
import { computeHealthSnapshot } from '@/lib/dashboard/healthSnapshot';
import { computePatternLevel } from '@/lib/dashboard/patternLevel';
import { detectPatterns } from '@/lib/dashboard/patterns';
import { generateSmartInsights } from '@/lib/dashboard/smartInsights';
import { generateWeeklyInsight } from '@/lib/dashboard/insights';
import { computeTrackerSummary, buildDailyTrends } from '@/lib/dashboard/trackerSummary';
import {
  getLatestWeeklyInsight,
  isWeeklyInsightStale,
  saveWeeklyInsight,
} from '@/lib/db/weeklyInsights';
import { computeUpcomingEvents } from '@/lib/dashboard/upcomingEvents';

export function useDashboard() {
  const { profile, preferences, user } = useAuth();
  const { data: periods, loading: periodsLoading, refresh: refreshPeriods } = usePeriodLogs({ limit: 24 });
  const { data: moodLogs, loading: moodLoading, refresh: refreshMood } = useMoodLogs({ limit: 60 });
  const { data: sleepLogs, loading: sleepLoading, refresh: refreshSleep } = useSleepLogs({ limit: 60 });
  const { data: metabolicLogs, loading: metabolicLoading, refresh: refreshMetabolic } = useMetabolicLogs({ limit: 30 });
  const { data: androgenLogs, loading: androgenLoading } = useAndrogenLogs({ limit: 12 });
  const [latestQuiz, setLatestQuiz] = useState<Awaited<ReturnType<typeof listQuizResults>>[0] | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [weeklyInsight, setWeeklyInsight] = useState('');

  const summary = useMemo(
    () => computeTrackerSummary({ moodLogs, sleepLogs, metabolicLogs, periods, days: 30 }),
    [moodLogs, sleepLogs, metabolicLogs, periods],
  );

  const trends = useMemo(
    () => buildDailyTrends({ moodLogs, sleepLogs, metabolicLogs, days: 30 }),
    [moodLogs, sleepLogs, metabolicLogs],
  );

  useEffect(() => {
    setDataError(null);
    listQuizResults()
      .then((r) => setLatestQuiz(r[0] ?? null))
      .catch(() => setDataError('Some dashboard data could not load'));
  }, []);

  const cycle = useMemo(
    () => computeCycleForecast(periods, preferences, profile),
    [periods, preferences, profile],
  );

  const health = useMemo(
    () =>
      computeHealthSnapshot(
        profile,
        summary,
        trends,
        latestQuiz,
        moodLogs.length + sleepLogs.length + periods.length,
      ),
    [profile, summary, trends, latestQuiz, moodLogs.length, sleepLogs.length, periods.length],
  );

  const patterns = useMemo(() => detectPatterns(trends, cycle), [trends, cycle]);

  const patternLevel = useMemo(
    () => computePatternLevel(patterns, health, summary?.daysLogged ?? 0),
    [patterns, health, summary?.daysLogged],
  );

  const smartInsights = useMemo(
    () =>
      generateSmartInsights({
        cycle,
        sleepLogs,
        moodLogs,
        periods,
        androgenLogs,
      }),
    [cycle, sleepLogs, moodLogs, periods, androgenLogs],
  );

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const cached = await getLatestWeeklyInsight(user.id);
        if (!cancelled && cached && !isWeeklyInsightStale(cached)) {
          setWeeklyInsight(cached.insight);
          return;
        }
        const insight = generateWeeklyInsight(profile, summary, cycle, patterns);
        if (!cancelled) {
          setWeeklyInsight(insight);
          await saveWeeklyInsight(insight);
        }
      } catch {
        if (!cancelled) {
          setWeeklyInsight(generateWeeklyInsight(profile, summary, cycle, patterns));
        }
      }
    })();

    return () => { cancelled = true; };
  }, [user, profile, summary, cycle, patterns]);

  const upcomingEvents = useMemo(() => {
    const lastAndrogen = androgenLogs.find((l) => !l.deleted_at)?.logged_date ?? null;
    return computeUpcomingEvents({ cycle, lastAndrogenLogDate: lastAndrogen, latestQuiz });
  }, [cycle, androgenLogs, latestQuiz]);

  const today = new Date().toISOString().split('T')[0];
  const todayMood = moodLogs.find((m) => m.logged_date === today && !m.deleted_at);
  const todaySleep = sleepLogs.find((s) => s.logged_date === today && !s.deleted_at);
  const todayMetabolic = metabolicLogs.find((m) => m.logged_date === today && !m.deleted_at);

  const refreshCheckIn = useCallback(() => {
    void refreshMood();
    void refreshSleep();
    void refreshMetabolic();
    void refreshPeriods();
  }, [refreshMood, refreshSleep, refreshMetabolic, refreshPeriods]);

  const loading =
    periodsLoading || moodLoading || sleepLoading || metabolicLoading || androgenLoading;

  return {
    profile,
    summary,
    cycle,
    health,
    smartInsights,
    patterns,
    patternLevel,
    weeklyInsight,
    upcomingEvents,
    latestQuiz,
    todayMood,
    todaySleep,
    todayMetabolic,
    refreshCheckIn,
    loading,
    dataError,
  };
}
