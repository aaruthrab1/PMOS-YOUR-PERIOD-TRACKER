import { cn } from '@/lib/tokens';

export type TrackerTab = 'period' | 'sleep' | 'weight' | 'mood' | 'metabolic';

const TABS: { id: TrackerTab; label: string }[] = [
  { id: 'period', label: 'Period' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'weight', label: 'Weight' },
  { id: 'mood', label: 'Mood' },
  { id: 'metabolic', label: 'Metabolic' },
];

interface TrackerPillNavProps {
  active: TrackerTab;
  onChange: (tab: TrackerTab) => void;
}

export function TrackerPillNav({ active, onChange }: TrackerPillNavProps) {
  return (
    <nav
      className="mb-6 -mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      aria-label="Tracker sections"
    >
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        const isPeriod = id === 'period';

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-lg px-3.5 py-2 text-caption font-medium transition-colors',
              isActive
                ? isPeriod
                  ? 'bg-cycle-500 text-ink-inverse'
                  : 'bg-brand-500 text-ink-inverse'
                : 'border border-border bg-surface text-ink-secondary hover:border-border-strong hover:text-ink',
            )}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export { TABS as TRACKER_TABS };
