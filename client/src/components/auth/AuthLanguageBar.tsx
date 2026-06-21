import { Globe } from 'lucide-react';
import { usePersonalization, CYRA_LANGUAGES } from '@/contexts/PersonalizationContext';
import type { CyraLanguageCode } from '@/lib/personalization';
import { cn } from '@/lib/tokens';

/** Compact language switcher for public auth / landing screens */
export function AuthLanguageBar() {
  const { language, setLanguage, nativeLanguageLabel } = usePersonalization();

  return (
    <div className="mb-6 rounded-2xl border border-border/80 bg-surface/80 px-3 py-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2">
        <Globe className="h-4 w-4 text-brand-500" aria-hidden="true" />
        <span className="text-micro font-medium text-ink-secondary">
          Language · {nativeLanguageLabel}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CYRA_LANGUAGES.slice(0, 6).map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => void setLanguage(lang.code as CyraLanguageCode)}
            aria-pressed={language === lang.code}
            className={cn(
              'rounded-full px-2.5 py-1 text-micro font-medium transition-colors',
              language === lang.code
                ? 'bg-brand-500 text-ink-inverse'
                : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary',
            )}
          >
            {lang.nativeLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
