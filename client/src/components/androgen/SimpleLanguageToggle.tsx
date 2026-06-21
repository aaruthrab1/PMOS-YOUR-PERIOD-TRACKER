import { Languages } from 'lucide-react';
import { cn } from '@/lib/tokens';

interface SimpleLanguageToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

export function SimpleLanguageToggle({ enabled, onChange }: SimpleLanguageToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-micro font-medium transition-all ring-1',
        enabled ? 'chip-active' : 'bg-surface-secondary text-ink-secondary ring-border',
      )}
    >
      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
      Simple language
    </button>
  );
}
