import type { CareCity } from './types';
import { CLINIC_FILTERS, type ClinicFilter } from './clinicFinder';

export interface ClinicSearchLink {
  id: string;
  city: CareCity;
  label: string;
  specialty: string;
  mapsQuery: string;
}

export function clinicSearchLinks(city: CareCity, filter: ClinicFilter): ClinicSearchLink[] {
  const filterDef = CLINIC_FILTERS.find((f) => f.id === filter);
  const label = filterDef?.label ?? "Women's Health";
  const base = filterDef?.mapsQuery ?? "women's health clinic";

  return [
    {
      id: `${city}-${filter}-primary`,
      city,
      label: `${label} — ${city}`,
      specialty: label,
      mapsQuery: `${base} ${city} India`,
    },
    {
      id: `${city}-${filter}-hospital`,
      city,
      label: `Hospitals with ${label.toLowerCase()} — ${city}`,
      specialty: label,
      mapsQuery: `hospital ${base} ${city} India`,
    },
  ];
}

export function nearbySearchLinks(filter: ClinicFilter, lat: number, lng: number): ClinicSearchLink[] {
  const filterDef = CLINIC_FILTERS.find((f) => f.id === filter);
  const label = filterDef?.label ?? "Women's Health";
  const base = filterDef?.mapsQuery ?? "women's health clinic";

  return [
    {
      id: `nearby-${filter}`,
      city: 'Delhi' as CareCity,
      label: `Nearby ${label}`,
      specialty: label,
      mapsQuery: `${base} near ${lat},${lng}`,
    },
  ];
}

export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** @deprecated Use clinicSearchLinks — kept for import compatibility */
export function clinicsForCity(city: CareCity, filter: ClinicFilter = 'womens_health'): ClinicSearchLink[] {
  return clinicSearchLinks(city, filter);
}
