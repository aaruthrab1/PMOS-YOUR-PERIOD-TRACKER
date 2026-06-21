import { lazy, Suspense, useState } from 'react';
import { Scale } from 'lucide-react';
import { Card, Button, EmptyState } from '@/components/ui';
import { TrackerInsightPanel } from './TrackerInsightPanel';
import { TrackerTabSkeleton } from './TrackerTabSkeleton';
import type { useTrackerData } from '@/hooks/useTrackerData';
import type { WeightUnit } from '@/types/supabase';

const TrendLineChart = lazy(() =>
  import('./charts/TrendLineChart').then((m) => ({ default: m.TrendLineChart })),
);

type TrackerContext = ReturnType<typeof useTrackerData>;

interface WeightTrackerTabProps {
  tracker: TrackerContext;
}

export function WeightTrackerTab({ tracker }: WeightTrackerTabProps) {
  const { weightLogs, weightAnalytics, weightActions, loading } = tracker;
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>(weightAnalytics.unit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    setSaving(true);
    setError('');
    try {
      await weightActions.upsert({
        logged_date: date,
        weight: w,
        unit,
        body_fat_percent: null,
        notes: null,
      });
      setWeight('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save weight');
    } finally {
      setSaving(false);
    }
  };

  if (loading && weightLogs.length === 0) {
    return <TrackerTabSkeleton />;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <Card padding="sm" className="flex items-start gap-3 bg-surface-secondary/50">
        <Scale className="h-5 w-5 shrink-0 text-ink-secondary mt-0.5" aria-hidden="true" />
        <p className="text-caption text-ink-secondary leading-relaxed">
          Weight tracking is for your personal awareness. Trends are described neutrally — there are no &quot;good&quot; or &quot;bad&quot; numbers here.
        </p>
      </Card>

      <Card>
        <p className="section-label mb-3">Weight trend</p>
        {weightAnalytics.trend.length >= 2 ? (
          <Suspense fallback={<TrackerTabSkeleton />}>
            <TrendLineChart data={weightAnalytics.trend} label={`Weight (${unit})`} color="brand" />
          </Suspense>
        ) : (
          <EmptyState
            icon={Scale}
            title="No weight trend yet"
            description="Log your weight on two or more days to see how it changes over time — neutrally, without judgment."
            className="!py-8"
          />
        )}
      </Card>

      {weightAnalytics.monthlyAverages.length > 1 && (
        <Card>
          <p className="section-label mb-3">Monthly averages</p>
          <Suspense fallback={<TrackerTabSkeleton />}>
            <TrendLineChart data={weightAnalytics.monthlyAverages} label={`Avg (${unit})`} color="brand" />
          </Suspense>
        </Card>
      )}

      <TrackerInsightPanel insights={weightAnalytics.insights} />

      <Card>
        <p className="section-label mb-4">Log weight</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-micro text-ink-tertiary">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field mt-1 w-full" />
          </label>

          <div className="flex gap-3">
            <label className="flex-1">
              <span className="text-micro text-ink-tertiary">Weight</span>
              <input
                type="number"
                step="0.1"
                min="1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                className="input-field mt-1 w-full"
              />
            </label>
            <fieldset className="pt-5">
              <div className="flex gap-1">
                {(['kg', 'lb'] as WeightUnit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    aria-pressed={unit === u}
                    className={`rounded-lg px-3 py-2 text-micro font-medium ${
                      unit === u ? 'bg-brand-500 text-white' : 'bg-surface-secondary'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {error && <p className="text-caption text-risk-high" role="alert">{error}</p>}

          <Button onClick={handleSave} disabled={saving || !weight} className="w-full">
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save weight'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
