import { useState } from 'react';
import { Globe, MapPin, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/tokens';
import {
  usePersonalization,
  CYRA_LANGUAGES,
  INDIA_REGIONS,
} from '@/contexts/PersonalizationContext';
import type { CyraLanguageCode, IndiaRegion } from '@/lib/personalization';

export function LanguageSelector() {
  const { language, setLanguage, nativeLanguageLabel, t } = usePersonalization();
  const [toast, setToast] = useState<string | null>(null);

  const handleSelect = async (code: CyraLanguageCode) => {
    if (code === language) return;
    await setLanguage(code);
    setToast(t('settings.languageChanged'));
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand-500" aria-hidden="true" />
          <div>
            <p className="section-label !mb-0">{t('settings.language')}</p>
            <p className="text-micro text-ink-tertiary">
              {t('settings.languageDesc')} · {nativeLanguageLabel}
            </p>
          </div>
        </div>
        {toast && (
          <span className="text-micro font-medium text-brand-500 animate-fade-in">{toast}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CYRA_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleSelect(lang.code as CyraLanguageCode)}
            aria-pressed={language === lang.code}
            className={cn(
              'rounded-2xl px-3 py-2.5 text-left transition-all',
              language === lang.code
                ? 'bg-surface-tertiary ring-1 ring-border'
                : 'bg-surface-secondary hover:bg-surface-tertiary',
            )}
          >
            <p className="text-caption font-medium text-ink">{lang.nativeLabel}</p>
            <p className="text-micro text-ink-tertiary">{lang.label}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}

export function SimpleLanguageSwitch() {
  const { simpleLanguage, setSimpleLanguage, t } = usePersonalization();

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 shrink-0 text-brand-500 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-caption font-medium text-ink">{t('settings.simpleLanguage')}</p>
            <p className="mt-0.5 text-micro text-ink-secondary leading-relaxed">
              {t('settings.simpleLanguageDesc')}
            </p>
            <p className="mt-2 text-micro font-medium text-brand-500">
              {simpleLanguage ? t('personalization.simpleOn') : t('personalization.simpleOff')}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={simpleLanguage}
          onClick={() => setSimpleLanguage(!simpleLanguage)}
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors',
            simpleLanguage ? 'bg-brand-500' : 'bg-surface-tertiary',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
              simpleLanguage ? 'translate-x-5' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>
    </Card>
  );
}

export function RegionSelector() {
  const { region, setRegion, t } = usePersonalization();

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-cycle-500" aria-hidden="true" />
        <div>
          <p className="section-label !mb-0">{t('settings.region')}</p>
          <p className="text-micro text-ink-tertiary">{t('settings.regionDesc')}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {INDIA_REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id as IndiaRegion)}
            aria-pressed={region === r.id}
            className={cn(
              'rounded-2xl px-3 py-2.5 text-caption font-medium transition-all',
              region === r.id
                ? 'bg-surface-tertiary ring-1 ring-border text-ink'
                : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
