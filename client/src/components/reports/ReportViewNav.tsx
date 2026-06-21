import { cn } from '@/lib/tokens';
import type { ReportViewMode } from '@/lib/reports';

interface ReportViewNavProps {
  mode: ReportViewMode;
  onChange: (mode: ReportViewMode) => void;
}

const TABS: { id: ReportViewMode; label: string }[] = [
  { id: 'summary', label: 'Health summary' },
  { id: 'prep', label: 'Doctor prep' },
  { id: 'export', label: 'Export' },
];

export function ReportViewNav({ mode, onChange }: ReportViewNavProps) {
  return (
    <nav className="flex gap-1 rounded-2xl bg-surface-secondary p-1" aria-label="Report views">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-current={mode === tab.id ? 'page' : undefined}
          className={cn(
            'flex-1 rounded-xl px-3 py-2.5 text-micro font-semibold transition-all duration-200',
            mode === tab.id
              ? 'bg-surface text-ink shadow-xs'
              : 'text-ink-tertiary hover:text-ink-secondary',
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
