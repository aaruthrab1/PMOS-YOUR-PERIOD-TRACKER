import { useMemo } from 'react';
import { useLocalizedPageTitle } from '@/hooks/useLocalizedPageTitle';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useDashboard } from '@/hooks/useDashboard';
import { computeSuggestedActions } from '@/lib/dashboard/suggestedActions';
import {
  HomeHero,
  TodayHealthStrip,
  PrimaryInsight,
  SuggestedActions,
  HomeUpcoming,
  HomeQuickAccess,
  HomeLearnTeaser,
  DashboardGetStarted,
} from '@/components/home';
import {
  DashboardSkeleton,
  PatternDetectionSection,
  WeeklyInsightSection,
} from '@/components/dashboard';

export function DashboardPage() {
  useLocalizedPageTitle('page.dashboard');
  const { t } = usePersonalization();

  const {
    profile,
    cycle,
    health,
    smartInsights,
    patterns,
    weeklyInsight,
    upcomingEvents,
    todayMood,
    todaySleep,
    todayMetabolic,
    loading,
    dataError,
  } = useDashboard();

  const suggestedActions = useMemo(
    () =>
      computeSuggestedActions({
        cycle,
        health,
        smartInsights,
        todayMood,
        todaySleep,
        todayMetabolic,
      }),
    [cycle, health, smartInsights, todayMood, todaySleep, todayMetabolic],
  );

  const initialLoad = loading && !profile;

  if (initialLoad) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="page-container pb-8 md:max-w-lg page-enter">
      {dataError && (
        <div
          className="mb-4 rounded-xl border border-risk-moderate-border bg-risk-moderate-bg px-3 py-2 text-micro text-risk-moderate"
          role="alert"
        >
          {t('error.loadFailed')}
        </div>
      )}

      <div className="home-stack">
        <HomeHero
          name={profile?.full_name}
          avatarUrl={profile?.avatar_url}
          cycle={cycle}
          health={health}
        />

        <DashboardGetStarted show={!cycle.hasData && !loading} />

        <HomeQuickAccess />

        <TodayHealthStrip
          todayMood={todayMood}
          todaySleep={todaySleep}
          cycleDay={cycle.cycleDay}
          cyclePhase={cycle.phase}
          hasCycleData={cycle.hasData}
        />

        <PrimaryInsight insights={smartInsights} loading={loading} />

        <PatternDetectionSection patterns={patterns} loading={loading} />

        <WeeklyInsightSection insight={weeklyInsight} loading={loading && !weeklyInsight} />

        <SuggestedActions actions={suggestedActions} />

        <HomeUpcoming events={upcomingEvents} />

        <HomeLearnTeaser />
      </div>
    </div>
  );
}
