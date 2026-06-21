import { lazy, Suspense, useState } from 'react';
import { Moon } from 'lucide-react';
import { Card, Button, EmptyState } from '@/components/ui';
import { TrackerInsightPanel } from './TrackerInsightPanel';
import { TrackerTabSkeleton } from './TrackerTabSkeleton';
import { ScaleInput } from './ScaleInput';
import type { useTrackerData } from '@/hooks/useTrackerData';

const TrendLineChart = lazy(() =>
  import('./charts/TrendLineChart').then((m) => ({ default: m.TrendLineChart })),
);

type TrackerContext = ReturnType<typeof useTrackerData>;

interface SleepTrackerTabProps {
  tracker: TrackerContext;
}

const HOUR_PRESETS = [4, 5, 6, 7, 8, 9, 10];

export function SleepTrackerTab({ tracker }: SleepTrackerTabProps) {
  const { sleepLogs, sleepAnalytics, sleepActions, loading } = tracker;
  const today = new Date().toISOString().split('T')[0];
  const todayLog = sleepLogs.find((l) => l.logged_date === today && !l.deleted_at);

  const [date, setDate] = useState(today);
  const [hours, setHours] = useState<number | null>(todayLog?.sleep_hours ?? 7);
  const [restedness, setRestedness] = useState<number | null>(todayLog?.sleep_quality ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (hours == null) return;
    setSaving(true);
    setError('');
    try {
      await sleepActions.upsert({
        logged_date: date,
        sleep_hours: hours,
        sleep_quality: restedness,
        bedtime: null,
        wake_time: null,
        notes: null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save sleep log');
    } finally {
      setSaving(false);
    }
  };

  if (loading && sleepLogs.length === 0) {
    return <TrackerTabSkeleton />;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {sleepLogs.length === 0 && (
        <EmptyState
          icon={Moon}
          title="Start sleep tracking"
          description="Track your sleep for a few days to discover patterns."
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card padding="sm" className="text-center">
          <p className="font-display text-title text-ink">{sleepAnalytics.weeklyAverage ?? '—'}h</p>
          <p className="text-micro text-ink-tertiary">Weekly avg</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="font-display text-title text-ink">{sleepAnalytics.monthlyAverage ?? '—'}h</p>
          <p className="text-micro text-ink-tertiary">Monthly avg</p>
        </Card>
      </div>

      <Card>
        <p className="section-label mb-3">30-day sleep trend</p>
        <Suspense fallback={<TrackerTabSkeleton />}>
          <TrendLineChart data={sleepAnalytics.trend30} label="Hours" color="brand" />
        </Suspense>
      </Card>

      {sleepAnalytics.restednessTrend.length > 0 && (
        <Card>
          <p className="section-label mb-3">Restedness trend</p>
          <Suspense fallback={<TrackerTabSkeleton />}>
            <TrendLineChart data={sleepAnalytics.restednessTrend} label="Restedness" color="cycle" />
          </Suspense>
        </Card>
      )}

      <TrackerInsightPanel insights={sleepAnalytics.insights} />

      <Card>
        <p className="section-label mb-4">Log sleep</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-micro text-ink-tertiary">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field mt-1 w-full" />
          </label>

          <fieldset>
            <legend className="text-micro text-ink-tertiary mb-2">Hours slept</legend>
            <div className="flex flex-wrap gap-2">
              {HOUR_PRESETS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  aria-pressed={hours === h}
                  className={`rounded-full px-4 py-2 text-caption font-medium ring-1 ${
                    hours === h ? 'bg-brand-500 text-ink-inverse' : 'border border-border bg-surface text-ink-secondary'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </fieldset>

          <ScaleInput label="How rested do you feel?" value={restedness} onChange={setRestedness} />

          {error && <p className="text-caption text-risk-high" role="alert">{error}</p>}

          <Button onClick={handleSave} disabled={saving || hours == null} className="w-full">
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save sleep'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
