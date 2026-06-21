import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/tokens';

interface PeriodCalendarProps {
  month: Date;
  onMonthChange: (d: Date) => void;
  periodDays: Set<string>;
  predictedDays: Set<string>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PeriodCalendar({ month, onMonthChange, periodDays, predictedDays }: PeriodCalendarProps) {
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prev = () => onMonthChange(new Date(year, monthIdx - 1, 1));
  const next = () => onMonthChange(new Date(year, monthIdx + 1, 1));

  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-3xl border border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={prev} className="rounded-xl p-2 hover:bg-surface-secondary" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="font-display text-title-sm text-ink">{monthLabel}</p>
        <button type="button" onClick={next} className="rounded-xl p-2 hover:bg-surface-secondary" aria-label="Next month">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-micro text-ink-tertiary mb-2">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day == null) return <div key={`e-${i}`} />;
          const iso = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPeriod = periodDays.has(iso);
          const isPredicted = predictedDays.has(iso);
          const isToday = iso === today;

          return (
            <div
              key={iso}
              className={cn(
                'flex h-9 items-center justify-center rounded-lg text-caption font-medium',
                isPeriod && 'bg-cycle-500 text-ink-inverse',
                !isPeriod && isPredicted && 'bg-cycle-100 text-cycle-700 ring-1 ring-cycle-200 ring-dashed dark:bg-surface-elevated dark:text-cycle-500 dark:ring-border',
                !isPeriod && !isPredicted && 'text-ink-secondary',
                isToday && !isPeriod && 'ring-2 ring-brand-500/35',
              )}
              aria-label={`${iso}${isPeriod ? ', period day' : ''}${isPredicted ? ', predicted' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-micro text-ink-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-cycle-500" aria-hidden="true" /> Logged period
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-cycle-100 ring-1 ring-cycle-200 ring-dashed dark:bg-surface-elevated dark:ring-border" aria-hidden="true" /> Predicted
        </span>
      </div>
    </div>
  );
}
