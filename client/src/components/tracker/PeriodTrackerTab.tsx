import { lazy, Suspense, useState } from 'react';
import { Calendar, Droplets } from 'lucide-react';
import { Card, Badge, Button, ProgressBar, EmptyState } from '@/components/ui';
import { PeriodCalendar } from './PeriodCalendar';
import { TrackerInsightPanel } from './TrackerInsightPanel';
import { TrackerTabSkeleton } from './TrackerTabSkeleton';
import { ScaleInput } from './ScaleInput';
import { FLOW_OPTIONS } from '@/lib/constants';
import { formatForecastDate } from '@/lib/dashboard/cycleForecast';
import type { useTrackerData } from '@/hooks/useTrackerData';
import type { FlowIntensity } from '@/types/supabase';
import { cn } from '@/lib/tokens';

const CycleLengthChart = lazy(() =>
  import('./charts/CycleLengthChart').then((m) => ({ default: m.CycleLengthChart })),
);

type TrackerContext = ReturnType<typeof useTrackerData>;

interface PeriodTrackerTabProps {
  tracker: TrackerContext;
}

export function PeriodTrackerTab({ tracker }: PeriodTrackerTabProps) {
  const { periods, cycle, periodAnalytics, periodActions, loading } = tracker;
  const [month, setMonth] = useState(() => new Date());
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState<FlowIntensity>('medium');
  const [pain, setPain] = useState<number | null>(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await periodActions.create({
        period_start: startDate,
        period_end: endDate || null,
        flow_intensity: flow,
        pain_level: pain,
        cycle_length: null,
        symptoms: [],
        notes: null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save period');
    } finally {
      setSaving(false);
    }
  };

  if (loading && periods.length === 0) {
    return <TrackerTabSkeleton />;
  }

  const latest = periods.filter((p) => !p.deleted_at).sort((a, b) => b.period_start.localeCompare(a.period_start))[0];

  return (
    <div className="space-y-6 animate-slide-up">
      {periods.length === 0 ? (
        <EmptyState
          icon={Droplets}
          context="cycle"
          title="Start tracking cycles"
          description="No period logged yet. Add your first cycle to begin tracking."
          action={{ label: 'Scroll to log form', onClick: () => document.getElementById('period-form')?.scrollIntoView({ behavior: 'smooth' }) }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Avg cycle" value={periodAnalytics.averageCycleLength ? `${periodAnalytics.averageCycleLength}d` : '—'} />
            <Stat label="Last cycle" value={periodAnalytics.lastCycleLength ? `${periodAnalytics.lastCycleLength}d` : '—'} />
            <Stat label="Consistency" value={`${periodAnalytics.consistencyScore}%`} />
            <Stat label="Forecast" value={`${periodAnalytics.forecastConfidence}%`} />
          </div>

          {cycle.hasData && cycle.nextPeriodDate && (
            <Card variant="cycle" padding="sm">
              <p className="text-micro text-ink-tertiary">Predicted next period</p>
              <p className="font-display text-title text-ink">
                {formatForecastDate(cycle.nextPeriodDate)}
                {cycle.daysUntilNextPeriod != null && (
                  <span className="ml-2 text-caption font-normal text-ink-secondary">
                    (~{cycle.daysUntilNextPeriod} days)
                  </span>
                )}
              </p>
            </Card>
          )}

          <PeriodCalendar
            month={month}
            onMonthChange={setMonth}
            periodDays={periodAnalytics.periodDays}
            predictedDays={periodAnalytics.predictedDays}
          />

          {latest && (
            <Card>
              <p className="section-label">Last cycle summary</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="cycle">{latest.period_start}{latest.period_end ? ` → ${latest.period_end}` : ''}</Badge>
                {latest.flow_intensity && <Badge variant="outline">{latest.flow_intensity}</Badge>}
                {latest.pain_level && <Badge variant="outline">Pain {latest.pain_level}/5</Badge>}
              </div>
            </Card>
          )}

          <Card>
            <p className="section-label mb-3">Last 6 cycle lengths</p>
            <Suspense fallback={<TrackerTabSkeleton />}>
              <CycleLengthChart data={periodAnalytics.lastSixCycles} />
            </Suspense>
            {periodAnalytics.lastSixCycles.length > 0 && (
              <ProgressBar
                value={periodAnalytics.consistencyScore}
                label="Cycle consistency"
                showValue
                color="cycle"
                className="mt-4"
              />
            )}
          </Card>
        </>
      )}

      <TrackerInsightPanel insights={periodAnalytics.insights} />

      <Card>
        <div id="period-form">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cycle-500" aria-hidden="true" />
          <p className="section-label !mb-0">Log period</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-micro text-ink-tertiary">Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field mt-1 w-full"
              />
            </label>
            <label className="block">
              <span className="text-micro text-ink-tertiary">End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field mt-1 w-full"
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-micro text-ink-tertiary mb-2">Flow</legend>
            <div className="flex flex-wrap gap-2">
              {FLOW_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFlow(value)}
                  aria-pressed={flow === value}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-micro font-medium transition-colors',
                    flow === value
                      ? 'bg-cycle-500 text-white'
                      : 'bg-surface-secondary text-ink-secondary ring-1 ring-border',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <ScaleInput label="Pain level" value={pain} onChange={setPain} />

          {error && <p className="text-caption text-risk-high" role="alert">{error}</p>}

          <Button variant="cycle" onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save period'}
          </Button>
        </div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-secondary px-3 py-2.5 text-center ring-1 ring-border/50">
      <p className="font-display text-title-sm text-ink">{value}</p>
      <p className="text-micro text-ink-tertiary">{label}</p>
    </div>
  );
}
