import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, WifiOff } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert, Button } from '@/components/ui';
import { useLocalizedPageTitle } from '@/hooks/useLocalizedPageTitle';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useTrackerData } from '@/hooks/useTrackerData';
import { friendlyLoadError } from '@/lib/userMessages';
import {
  TrackerPillNav,
  TrackerInsightPanel,
  PeriodTrackerTab,
  SleepTrackerTab,
  WeightTrackerTab,
  MoodTrackerTab,
  MetabolicTrackerTab,
  TrackerTabSkeleton,
  TrackerOverviewHero,
  type TrackerTab,
} from '@/components/tracker';

const TAB_VALUES: TrackerTab[] = ['period', 'sleep', 'weight', 'mood', 'metabolic'];

export function TrackerPage() {
  useLocalizedPageTitle('page.tracker');
  const { t } = usePersonalization();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TrackerTab | null;
  const initialTab = tabParam && TAB_VALUES.includes(tabParam) ? tabParam : 'period';
  const tracker = useTrackerData();
  const [tab, setTab] = useState<TrackerTab>(initialTab);

  const tabInsights = tracker.insights.filter((i) => {
    if (tab === 'period') return i.category === 'period' || i.category === 'general';
    return i.category === tab || (i.category === 'general' && tab === 'metabolic');
  });

  const handleRetry = () => tracker.refreshAll();
  const initialLoad = tracker.loading && !tracker.fromCache && tracker.periods.length === 0;

  if (initialLoad) {
    return (
      <div className="page-container pb-8 page-enter">
        <PageHeader title={t('tracker.title')} />
        <TrackerTabSkeleton />
      </div>
    );
  }

  return (
    <div className="page-container pb-8 page-enter">
      <PageHeader
        title={t('tracker.title')}
        subtitle={t('tracker.subtitle')}
        action={
          tracker.fromCache ? (
            <span className="flex items-center gap-1 text-micro text-ink-tertiary" title={t('common.offlineCached')}>
              <WifiOff className="h-4 w-4" aria-hidden="true" />
              {t('common.offlineCached')}
            </span>
          ) : undefined
        }
      />

      {tracker.error && (
        <Alert variant="error" className="mb-4">
          <div className="flex w-full items-center justify-between gap-3">
            <span>{friendlyLoadError(tracker.error)}</span>
            <Button size="sm" variant="ghost" onClick={handleRetry} className="!min-h-0 shrink-0">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {t('common.retry')}
            </Button>
          </div>
        </Alert>
      )}

      <TrackerOverviewHero tracker={tracker} />

      <TrackerPillNav active={tab} onChange={setTab} />

      {tab === 'period' && tabInsights.length > 0 && (
        <TrackerInsightPanel insights={tabInsights.slice(0, 3)} title="Cycle insights" />
      )}

      {tab === 'period' && <PeriodTrackerTab tracker={tracker} />}
      {tab === 'sleep' && <SleepTrackerTab tracker={tracker} />}
      {tab === 'weight' && <WeightTrackerTab tracker={tracker} />}
      {tab === 'mood' && <MoodTrackerTab tracker={tracker} />}
      {tab === 'metabolic' && <MetabolicTrackerTab tracker={tracker} />}
    </div>
  );
}
