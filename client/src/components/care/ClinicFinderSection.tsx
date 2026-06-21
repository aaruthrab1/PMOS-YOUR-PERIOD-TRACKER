import { useState } from 'react';
import { MapPin, ExternalLink, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { clinicSearchLinks, nearbySearchLinks, mapsUrl } from '@/lib/care/clinics';
import { CARE_CITIES } from '@/lib/care';
import type { CareCity } from '@/lib/care/types';
import {
  CLINIC_FILTERS,
  filterMapsQuery,
  mapsEmbedUrl,
  mapsSearchUrl,
  type ClinicFilter,
} from '@/lib/care/clinicFinder';
import { useClinicFinder } from '@/hooks/useClinicFinder';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { defaultCityForRegion } from '@/lib/personalization';
import { cn } from '@/lib/tokens';

export function ClinicFinderSection() {
  const { region, t } = usePersonalization();
  const finder = useClinicFinder();
  const [filter, setFilter] = useState<ClinicFilter>('womens_health');
  const [city, setCity] = useState<CareCity>(() => defaultCityForRegion(region));

  const mapsQuery = filterMapsQuery(filter, finder.position);
  const embedUrl = mapsEmbedUrl(mapsQuery, finder.position);
  const searchUrl = mapsSearchUrl(mapsQuery, finder.position);

  const searchLinks = finder.hasLocation && finder.position
    ? nearbySearchLinks(filter, finder.position.lat, finder.position.lng)
    : clinicSearchLinks(city, filter);

  return (
    <section id="clinic-finder" aria-labelledby="clinic-finder-heading">
      <h2 id="clinic-finder-heading" className="section-label mb-3">
        {t('care.clinicFinder')}
      </h2>

      <Card className="mb-4 !py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-caption font-semibold text-ink">{t('clinic.findNearYou')}</p>
            <p className="text-micro text-ink-tertiary">
              {finder.hasLocation
                ? 'Showing results based on your location'
                : 'Enable location for nearby search on Google Maps'}
            </p>
          </div>
          <Button
            size="sm"
            variant={finder.hasLocation ? 'secondary' : 'primary'}
            onClick={finder.requestLocation}
            disabled={finder.locationState === 'loading'}
          >
            {finder.locationState === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Navigation className="h-4 w-4" aria-hidden="true" />
            )}
            {finder.hasLocation ? 'Update location' : 'Use my location'}
          </Button>
        </div>
        {finder.locationError && (
          <p className="mt-2 flex items-center gap-1.5 text-micro text-risk-moderate">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {finder.locationError}
          </p>
        )}
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {CLINIC_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={cn(
              'rounded-full px-3 py-1.5 text-micro font-semibold transition-colors',
              filter === id
                ? 'bg-brand-500 text-ink-inverse'
                : 'border border-border bg-surface text-ink-secondary hover:bg-surface-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="mb-4 overflow-hidden !p-0">
        <iframe
          title="Google Maps clinic search"
          src={embedUrl}
          className="h-48 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
          <p className="text-micro text-ink-tertiary truncate">{mapsQuery}</p>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-micro font-semibold text-brand-500"
          >
            Open in Maps
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </Card>

      {!finder.hasLocation && (
        <Card padding="sm" className="mb-4">
          <p className="section-label mb-2">Or browse by city</p>
          <div className="flex flex-wrap gap-2">
            {CARE_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                aria-pressed={city === c}
                className={cn(
                  'rounded-full px-3 py-1 text-micro font-medium',
                  city === c ? 'bg-surface-tertiary text-ink ring-1 ring-border' : 'text-ink-secondary',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Card>
      )}

      <p className="mb-3 text-micro text-ink-muted">
        Search links open Google Maps — verify clinic details before visiting.
      </p>

      <div className="space-y-2">
        {searchLinks.map((link) => (
          <Card key={link.id} padding="sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-title-sm text-ink">{link.label}</p>
                <div className="mt-1 flex items-center gap-1 text-micro text-ink-tertiary">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {link.specialty}
                </div>
              </div>
              <a
                href={mapsUrl(link.mapsQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-surface-tertiary px-3 py-2 text-micro font-semibold text-brand-500 hover:border-border-strong"
              >
                Maps
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
