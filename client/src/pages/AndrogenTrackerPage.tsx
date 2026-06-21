import { useMemo, useState } from 'react';
import { RefreshCw, WifiOff, Microscope, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Badge, Button } from '@/components/ui';
import {
  SimpleLanguageToggle,
  WeeklyCheckInFlow,
  IntelligenceInsightsPanel,
  HairHealthSection,
  SkinHealthSection,
  FacialHairSection,
  ScalpHealthSection,
  DarkPatchesSection,
} from '@/components/androgen';
import { useAndrogenTracker } from '@/hooks/useAndrogenTracker';
import { parseCheckIn, weekStartDate } from '@/lib/androgen/checkIn';
import { getOptionLabel, HAIR_SHEDDING_OPTIONS, ACNE_OPTIONS } from '@/lib/androgen/constants';
import type { AndrogenWeeklyCheckIn } from '@/lib/androgen/types';
import type { Json } from '@/types/supabase';
import { useLocalizedPageTitle } from '@/hooks/useLocalizedPageTitle';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { cn } from '@/lib/tokens';

export function AndrogenTrackerPage() {
  useLocalizedPageTitle('page.androgen');
  const { t } = usePersonalization();

  const tracker = useAndrogenTracker();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [checkInOpen, setCheckInOpen] = useState(true);

  const weekStart = weekStartDate();
  const thisWeekLog = useMemo(
    () => tracker.logs.find((l) => l.logged_date === weekStart && !l.deleted_at),
    [tracker.logs, weekStart],
  );
  const thisWeekCheckIn = thisWeekLog ? parseCheckIn(thisWeekLog) : null;

  const handleSubmit = async (checkIn: AndrogenWeeklyCheckIn, loggedDate: string) => {
    setSaving(true);
    setError('');
    try {
      await tracker.upsert({
        logged_date: loggedDate,
        symptoms: checkIn as unknown as Json,
        lab_markers: {},
        testosterone_level: null,
        dhea_level: null,
        notes: null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your check-in');
    } finally {
      setSaving(false);
    }
  };

  const { simpleLanguage, setSimpleLanguage, analytics, intelligence, insights, fromCache, loading } = tracker;

  return (
    <div className="page-container pb-28 md:max-w-lg page-enter">
      <PageHeader
        title={t('androgen.title')}
        subtitle={t('androgen.subtitle')}
        action={
          <div className="flex flex-col items-end gap-2">
            <SimpleLanguageToggle enabled={simpleLanguage} onChange={setSimpleLanguage} />
            {fromCache && (
              <span className="flex items-center gap-1 text-micro text-ink-tertiary">
                <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
                Cached
              </span>
            )}
          </div>
        }
      />

      <Card className="mb-6 !py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary">
            <Microscope className="h-5 w-5 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-caption font-semibold text-ink">
              {analytics.checkInCount} weekly observation{analytics.checkInCount === 1 ? '' : 's'}
            </p>
            <p className="text-micro text-ink-tertiary">
              {analytics.showTrends
                ? 'Full intelligence active · cycle overlays enabled'
                : `${Math.max(0, 3 - analytics.checkInCount)} more to unlock trend analysis`}
            </p>
          </div>
          {thisWeekCheckIn && <Badge variant="brand">This week ✓</Badge>}
        </div>
      </Card>

      {tracker.error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-risk-high-bg px-4 py-3" role="alert">
          <p className="text-caption text-risk-high">{tracker.error}</p>
          <Button size="sm" variant="ghost" onClick={() => tracker.refresh()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      {saved && (
        <div className="mb-4 rounded-2xl bg-risk-low-bg px-4 py-3 text-caption text-risk-low animate-fade-in" role="status">
          Check-in saved — intelligence updating
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl bg-risk-high-bg px-4 py-3 text-caption text-risk-high" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <IntelligenceInsightsPanel insights={insights} />

        <section aria-labelledby="weekly-checkin-heading">
          <button
            type="button"
            onClick={() => setCheckInOpen((o) => !o)}
            className="mb-3 flex w-full items-center justify-between text-left"
            aria-expanded={checkInOpen}
          >
            <h2 id="weekly-checkin-heading" className="section-label !mb-0">
              Weekly check-in
            </h2>
            {checkInOpen ? (
              <ChevronUp className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            )}
          </button>
          {thisWeekCheckIn && !saved && !checkInOpen && (
            <p className="mb-3 text-micro text-ink-tertiary">
              Hair: {getOptionLabel(HAIR_SHEDDING_OPTIONS, thisWeekCheckIn.hair_shedding, simpleLanguage)}
              · Acne: {getOptionLabel(ACNE_OPTIONS, thisWeekCheckIn.acne, simpleLanguage)}
            </p>
          )}
          <div className={cn(!checkInOpen && 'hidden')}>
            <WeeklyCheckInFlow
              simpleLanguage={simpleLanguage}
              onSubmit={handleSubmit}
              initial={thisWeekCheckIn ?? undefined}
              saving={saving || loading}
            />
          </div>
        </section>

        <HairHealthSection
          intelligence={intelligence}
          showTrends={analytics.showTrends}
          simpleLanguage={simpleLanguage}
        />

        <SkinHealthSection
          intelligence={intelligence}
          showTrends={analytics.showTrends}
          simpleLanguage={simpleLanguage}
        />

        <FacialHairSection
          intelligence={intelligence}
          showTrends={analytics.showTrends}
          simpleLanguage={simpleLanguage}
        />

        <ScalpHealthSection
          intelligence={intelligence}
          showTrends={analytics.showTrends}
          simpleLanguage={simpleLanguage}
        />

        <DarkPatchesSection intelligence={intelligence} simpleLanguage={simpleLanguage} />

        {analytics.checkInCount > 0 && (
          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="section-label mb-3">
              Observation log
            </h2>
            <Card className="!p-0 divide-y divide-border">
              {[...analytics.checkIns].reverse().slice(0, 12).map(({ log, checkIn, phaseLabel }) => (
                <div key={log.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="text-caption font-medium text-ink">{log.logged_date}</p>
                    <p className="text-micro text-ink-tertiary">{phaseLabel}</p>
                  </div>
                  <div className="text-right text-micro text-ink-secondary">
                    <p>{getOptionLabel(HAIR_SHEDDING_OPTIONS, checkIn.hair_shedding, simpleLanguage)}</p>
                    <p>
                      Acne · Scalp {checkIn.scalp_oiliness}/{checkIn.scalp_dryness}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
