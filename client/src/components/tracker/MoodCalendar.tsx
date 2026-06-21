import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TRACKER_MOOD_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/tokens';

const MOOD_COLORS: Record<string, string> = {
  happy: 'bg-amber-200',
  calm: 'bg-emerald-200',
  anxious: 'bg-violet-200',
  sad: 'bg-blue-200',
  irritable: 'bg-orange-200',
  exhausted: 'bg-stone-300',
};

interface MoodCalendarProps {
  month: Date;
  onMonthChange: (d: Date) => void;
  moodByDate: Map<string, string>;
}

export function MoodCalendar({ month, onMonthChange, moodByDate }: MoodCalendarProps) {
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const moodMeta = (mood: string) =>
    TRACKER_MOOD_OPTIONS.find((m) => m.value === mood) ?? { emoji: '·', label: mood };

  return (
    <div className="rounded-3xl bg-surface p-4 ring-1 ring-border/60">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => onMonthChange(new Date(year, monthIdx - 1, 1))} className="rounded-xl p-2 hover:bg-surface-secondary" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-title-sm text-ink">
          {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <button type="button" onClick={() => onMonthChange(new Date(year, monthIdx + 1, 1))} className="rounded-xl p-2 hover:bg-surface-secondary" aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`Mood calendar for ${month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}>
        {cells.map((day, i) => {
          if (day == null) return <div key={`e-${i}`} role="gridcell" aria-hidden="true" />;
          const iso = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const mood = moodByDate.get(iso);
          const { emoji, label } = mood ? moodMeta(mood) : { emoji: '', label: 'No mood logged' };
          return (
            <div
              key={iso}
              role="gridcell"
              aria-label={mood ? `${day}: ${label}` : `${day}: no mood logged`}
              className={cn(
                'flex h-9 flex-col items-center justify-center rounded-lg text-[10px]',
                mood ? MOOD_COLORS[mood] ?? 'bg-surface-secondary' : 'text-ink-muted',
              )}
            >
              <span className="text-micro font-medium">{day}</span>
              {mood && <span className="text-xs leading-none" aria-hidden="true">{emoji}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
