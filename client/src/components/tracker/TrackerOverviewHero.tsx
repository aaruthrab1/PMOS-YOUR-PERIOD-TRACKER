import { TrendingUp, Calendar, Moon } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { useTrackerData } from '@/hooks/useTrackerData';

type TrackerData = ReturnType<typeof useTrackerData>;

interface TrackerOverviewHeroProps {
  tracker: TrackerData;
}

export function TrackerOverviewHero({ tracker }: TrackerOverviewHeroProps) {
  const { t } = usePersonalization();
  const { cycle, periodAnalytics, sleepAnalytics, moodAnalytics, periods } = tracker;

  const periodLogCount = periods.filter((p) => !p.deleted_at).length;
  const topMood = moodAnalytics.frequency[0];

  const stats = [
    {
      id: 'cycle',
      icon: Calendar,
      label: t('dashboard.cycleDay'),
      value: cycle.cycleDay != null ? `Day ${cycle.cycleDay}` : '—',
      detail: cycle.hasData ? cycle.phase : t('dashboard.logPeriod'),
    },
    {
      id: 'period',
      icon: TrendingUp,
      label: 'Avg cycle',
      value: periodAnalytics.averageCycleLength ? `${Math.round(periodAnalytics.averageCycleLength)}d` : '—',
      detail: periodLogCount > 0 ? `${periodLogCount} logs` : 'Start logging',
    },
    {
      id: 'sleep',
      icon: Moon,
      label: t('checkin.sleep'),
      value: sleepAnalytics.weeklyAverage != null ? `${sleepAnalytics.weeklyAverage}h` : '—',
      detail: '7-day avg',
    },
  ];

  return (
    <section aria-labelledby="tracker-overview-heading" className="mb-6">
      <h2 id="tracker-overview-heading" className="sr-only">Tracker overview</h2>
      <div className="home-metric-strip !grid-cols-3">
        {stats.map(({ id, icon: Icon, label, value, detail }) => (
          <div key={id} className="home-metric-cell pointer-events-none">
            <div className="home-metric-icon home-metric-icon--logged">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <p className="home-metric-label">{label}</p>
            <p className="home-metric-value">{value}</p>
            {detail && <p className="home-metric-sub">{detail}</p>}
          </div>
        ))}
      </div>
      {topMood && (
        <p className="mt-3 text-caption text-ink-secondary text-center">
          Recent mood pattern:{' '}
          <span className="font-medium text-ink">
            {topMood.emoji} {topMood.label}
          </span>
        </p>
      )}
    </section>
  );
}
