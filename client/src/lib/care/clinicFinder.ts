export type ClinicFilter =
  | 'womens_health'
  | 'endocrinologist'
  | 'gynecologist'
  | 'pcos_specialist';

export const CLINIC_FILTERS: { id: ClinicFilter; label: string; mapsQuery: string }[] = [
  { id: 'womens_health', label: "Women's Health", mapsQuery: "women's health clinic" },
  { id: 'endocrinologist', label: 'Endocrinologist', mapsQuery: 'endocrinologist' },
  { id: 'gynecologist', label: 'Gynecologist', mapsQuery: 'gynecologist' },
  { id: 'pcos_specialist', label: 'PCOS Specialist', mapsQuery: 'PCOS specialist clinic' },
];

export interface GeoPosition {
  lat: number;
  lng: number;
}

export function mapsSearchUrl(query: string, position?: GeoPosition | null): string {
  const q = encodeURIComponent(query);
  if (position) {
    return `https://www.google.com/maps/search/${q}/@${position.lat},${position.lng},14z`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function mapsEmbedUrl(query: string, position?: GeoPosition | null): string {
  const q = encodeURIComponent(query);
  if (position) {
    return `https://maps.google.com/maps?q=${q}&ll=${position.lat},${position.lng}&z=14&output=embed`;
  }
  return `https://maps.google.com/maps?q=${q}&output=embed`;
}

export function filterMapsQuery(filter: ClinicFilter, position?: GeoPosition | null): string {
  const def = CLINIC_FILTERS.find((f) => f.id === filter);
  const base = def?.mapsQuery ?? 'women\'s health clinic';
  if (position) return `${base} near ${position.lat},${position.lng}`;
  return base;
}

export function clinicMatchesFilter(specialty: string, filter: ClinicFilter): boolean {
  const s = specialty.toLowerCase();
  switch (filter) {
    case 'womens_health':
      return s.includes('women') || s.includes('reproductive') || s.includes('gynecology');
    case 'endocrinologist':
      return s.includes('endocrin');
    case 'gynecologist':
      return s.includes('gynec') || s.includes('reproductive');
    case 'pcos_specialist':
      return s.includes('pcos') || s.includes('hormone') || s.includes('metabolic');
    default:
      return true;
  }
}
