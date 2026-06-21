import { cn } from '@/lib/tokens';
import type { CareTab } from '@/lib/care/types';

const TABS: { id: CareTab; label: string }[] = [
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'clinics', label: 'Clinics' },
  { id: 'tests', label: 'Tests' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'doctor_prep', label: 'Doctor prep' },
];

interface CarePillNavProps {
  active: CareTab;
  onChange: (tab: CareTab) => void;
}

export function CarePillNav({ active, onChange }: CarePillNavProps) {
  return (
    <nav
      className="mb-6 -mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      aria-label="Care sections"
    >
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        const isCycle = id === 'cycle';

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-lg px-3.5 py-2 text-caption font-medium transition-colors',
              isActive
                ? isCycle
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
