import { lazy, Suspense, useState } from 'react';
import { Heart } from 'lucide-react';
import { Card, Button, EmptyState } from '@/components/ui';
import { MoodCalendar } from './MoodCalendar';
import { TrackerInsightPanel } from './TrackerInsightPanel';
import { TrackerTabSkeleton } from './TrackerTabSkeleton';
import { moodChartFromFrequency } from '@/lib/tracker/moodAnalytics';
import { TRACKER_MOOD_OPTIONS } from '@/lib/constants';
import type { useTrackerData } from '@/hooks/useTrackerData';
import type { MoodType } from '@/types/supabase';
import { cn } from '@/lib/tokens';

const MoodFrequencyChart = lazy(() =>
  import('./charts/MoodFrequencyChart').then((m) => ({ default: m.MoodFrequencyChart })),
);

type TrackerContext = ReturnType<typeof useTrackerData>;

interface MoodTrackerTabProps {
  tracker: TrackerContext;
}

export function MoodTrackerTab({ tracker }: MoodTrackerTabProps) {
  const { moodLogs, moodAnalytics, moodActions, loading } = tracker;
  const [month, setMonth] = useState(() => new Date());
  const today = new Date().toISOString().split('T')[0];
  const todayLog = moodLogs.find((l) => l.logged_date === today && !l.deleted_at);

  const [date, setDate] = useState(today);
  const [mood, setMood] = useState<MoodType>(todayLog?.mood ?? 'calm');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await moodActions.upsert({
        logged_date: date,
        mood,
        energy_level: todayLog?.energy_level ?? null,
        anxiety_level: null,
        triggers: [],
        notes: null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save mood');
    } finally {
      setSaving(false);
    }
  };

  const freqChart = moodChartFromFrequency(moodAnalytics.frequency);

  if (loading && moodLogs.length === 0) {
    return <TrackerTabSkeleton />;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {moodLogs.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Track your mood"
          description="Your mood patterns will appear here."
        />
      )}

      <MoodCalendar month={month} onMonthChange={setMonth} moodByDate={moodAnalytics.calendar} />

      {freqChart.length > 0 && (
        <Card>
          <p className="section-label mb-3">Mood frequency</p>
          <Suspense fallback={<TrackerTabSkeleton />}>
            <MoodFrequencyChart data={freqChart} />
          </Suspense>
        </Card>
      )}

      {Object.keys(moodAnalytics.phaseBreakdown).length > 0 && (
        <Card>
          <p className="section-label mb-3">Mood by cycle phase</p>
          <div className="space-y-3">
            {Object.entries(moodAnalytics.phaseBreakdown).map(([phase, moods]) => {
              const top = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];
              const emoji = TRACKER_MOOD_OPTIONS.find((m) => m.value === top?.[0])?.emoji ?? '·';
              return (
                <div key={phase} className="flex items-center justify-between rounded-xl bg-surface-secondary px-4 py-2.5">
                  <span className="text-caption font-medium text-ink">{phase}</span>
                  <span className="text-caption text-ink-secondary">
                    {top ? `${emoji} ${top[0]} (${top[1]}×)` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <TrackerInsightPanel insights={moodAnalytics.insights} />

      <Card>
        <p className="section-label mb-4">Log mood</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-micro text-ink-tertiary">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field mt-1 w-full" />
          </label>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TRACKER_MOOD_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMood(value)}
                aria-pressed={mood === value}
                aria-label={label}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl py-3 transition-all',
                  mood === value ? 'bg-surface-tertiary ring-2 ring-brand-500' : 'bg-surface-secondary hover:bg-surface-tertiary',
                )}
              >
                <span className="text-2xl" aria-hidden="true">{emoji}</span>
                <span className="text-[10px] text-ink-tertiary">{label}</span>
              </button>
            ))}
          </div>

          {error && <p className="text-caption text-risk-high" role="alert">{error}</p>}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save mood'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
