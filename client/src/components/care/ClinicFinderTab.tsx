import { useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui';
import { CARE_CITIES, clinicSearchLinks, mapsUrl } from '@/lib/care';
import type { CareCity } from '@/lib/care/types';
import { CLINIC_FILTERS, type ClinicFilter } from '@/lib/care/clinicFinder';
import { cn } from '@/lib/tokens';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { defaultCityForRegion, getRegionConfig } from '@/lib/personalization';

export function ClinicFinderTab() {
  const { region, t, simplify } = usePersonalization();
  const [city, setCity] = useState<CareCity>(() => defaultCityForRegion(region));
  const [filter, setFilter] = useState<ClinicFilter>('womens_health');
  const links = clinicSearchLinks(city, filter);
  const regionConfig = getRegionConfig(region);

  return (
    <div className="space-y-6 animate-slide-up">
      {regionConfig && (
        <Card padding="sm" className="border-border">
          <p className="text-caption text-ink-secondary leading-relaxed">
            {simplify(t('clinic.regionHint'))} {regionConfig.label} — try {regionConfig.foodExamples.slice(0, 2).join(', ')} and note how meals affect your energy.
          </p>
        </Card>
      )}

      <Card padding="sm">
        <p className="section-label mb-3">{t('clinic.selectCity')}</p>
        <div className="flex flex-wrap gap-2">
          {CARE_CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCity(c)}
              aria-pressed={city === c}
              className={cn(
                'rounded-full px-3 py-1.5 text-micro font-semibold transition-all',
                city === c
                  ? 'bg-brand-500 text-ink-inverse'
                  : 'border border-border bg-surface text-ink-secondary',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {CLINIC_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={cn(
              'rounded-full px-3 py-1.5 text-micro font-semibold',
              filter === id ? 'bg-brand-500 text-ink-inverse' : 'border border-border text-ink-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-caption text-ink-secondary">
        Open a search in Google Maps — verify details before visiting.
      </p>

      <div className="space-y-3">
        {links.map((link) => (
          <Card key={link.id} padding="sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-title-sm text-ink">{link.label}</p>
                <div className="mt-1 flex items-center gap-1 text-micro text-ink-tertiary">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {link.city}
                </div>
              </div>
              <a
                href={mapsUrl(link.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-surface-tertiary px-3 py-2 text-micro font-semibold text-brand-700 hover:border-border-strong"
              >
                Maps
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
