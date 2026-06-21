import { lazy, Suspense, useState } from 'react';
import { Activity } from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import { TrackerInsightPanel } from './TrackerInsightPanel';
import { TrackerTabSkeleton } from './TrackerTabSkeleton';
import { ScaleInput } from './ScaleInput';
import type { useTrackerData } from '@/hooks/useTrackerData';
import { cn } from '@/lib/tokens';

const TrendLineChart = lazy(() =>
  import('./charts/TrendLineChart').then((m) => ({ default: m.TrendLineChart })),
);
const EnergySleepScatterChart = lazy(() =>
  import('./charts/EnergySleepScatterChart').then((m) => ({ default: m.EnergySleepScatterChart })),
);

type TrackerContext = ReturnType<typeof useTrackerData>;

interface MetabolicTrackerTabProps {
  tracker: TrackerContext;
}

export function MetabolicTrackerTab({ tracker }: MetabolicTrackerTabProps) {
  const { metabolicLogs, metabolicAnalytics, metabolicActions, cycle, loading } = tracker;
  const today = new Date().toISOString().split('T')[0];
  const todayLog = metabolicLogs.find((l) => l.logged_date === today && !l.deleted_at);

  const [date, setDate] = useState(today);
  const [energy, setEnergy] = useState<number | null>(todayLog?.energy_level ?? null);
  const [hunger, setHunger] = useState<number | null>(todayLog?.hunger_level ?? null);
  const [sugarCravings, setSugarCravings] = useState(todayLog?.sugar_cravings ?? false);
  const [brainFog, setBrainFog] = useState(todayLog?.brain_fog ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await metabolicActions.upsert({
        logged_date: date,
        energy_level: energy,
        hunger_level: hunger,
        sugar_cravings: sugarCravings,
        brain_fog: brainFog,
        notes: null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save metabolic log');
    } finally {
      setSaving(false);
    }
  };

  if (loading && metabolicLogs.length === 0) {
    return <TrackerTabSkeleton />;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Energy (wk)" value={metabolicAnalytics.weeklyEnergy?.toString() ?? '—'} />
        <MiniStat label="Hunger (wk)" value={metabolicAnalytics.weeklyHunger?.toString() ?? '—'} />
        <MiniStat label="Cravings" value={`${metabolicAnalytics.cravingRate}%`} />
        <MiniStat label="Brain fog" value={`${metabolicAnalytics.brainFogRate}%`} />
      </div>

      {cycle.hasData && (
        <Card padding="sm" variant="cycle">
          <p className="text-micro text-ink-tertiary">Current cycle phase</p>
          <p className="font-display text-title-sm text-ink">{cycle.phase} · Day {cycle.cycleDay}</p>
        </Card>
      )}

      <Card>
        <p className="section-label mb-3">Energy trend</p>
        {metabolicAnalytics.energyTrend.length >= 2 ? (
          <Suspense fallback={<TrackerTabSkeleton />}>
            <TrendLineChart data={metabolicAnalytics.energyTrend} label="Energy" color="brand" />
          </Suspense>
        ) : (
          <EmptyState
            icon={Activity}
            title="Start metabolic tracking"
            description="Log energy, hunger, and cravings to spot patterns with sleep and your cycle."
            className="!py-8"
          />
        )}
      </Card>

      <Card>
        <p className="section-label mb-3">Energy vs sleep</p>
        <Suspense fallback={<TrackerTabSkeleton />}>
          <EnergySleepScatterChart data={metabolicAnalytics.correlationEnergySleep} />
        </Suspense>
      </Card>

      <TrackerInsightPanel insights={metabolicAnalytics.insights} />

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-500" aria-hidden="true" />
          <p className="section-label !mb-0">Log metabolic signals</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-micro text-ink-tertiary">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field mt-1 w-full" />
          </label>

          <ScaleInput label="Energy" value={energy} onChange={setEnergy} />
          <ScaleInput label="Hunger" value={hunger} onChange={setHunger} />

          <div className="grid grid-cols-2 gap-3">
            <ToggleChip
              label="Sugar cravings"
              active={sugarCravings}
              onClick={() => setSugarCravings((v) => !v)}
            />
            <ToggleChip
              label="Brain fog"
              active={brainFog}
              onClick={() => setBrainFog((v) => !v)}
            />
          </div>

          {error && <p className="text-caption text-risk-high" role="alert">{error}</p>}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save log'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-secondary px-3 py-2.5 text-center ring-1 ring-border/50">
      <p className="font-display text-title-sm text-ink">{value}</p>
      <p className="text-micro text-ink-tertiary">{label}</p>
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-2xl px-4 py-3 text-caption font-medium transition-all',
        active ? 'bg-brand-500 text-ink-inverse' : 'bg-surface-secondary text-ink-secondary ring-1 ring-border',
      )}
    >
      {label}
      {active && <Badge variant="outline" className="ml-2 !text-[10px] !py-0">Yes</Badge>}
    </button>
  );
}
