import type { AndrogenLog } from '@/types/supabase';
import type { AndrogenWeeklyCheckIn } from './types';

export function isWeeklyCheckIn(data: unknown): data is AndrogenWeeklyCheckIn {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  return o.version === 2 && typeof o.hair_shedding === 'string';
}

export function normalizeCheckIn(raw: AndrogenWeeklyCheckIn): AndrogenWeeklyCheckIn {
  return {
    ...raw,
    acne_zones: raw.acne_zones ?? [],
    scalp_dryness: raw.scalp_dryness ?? Math.max(1, Math.min(5, 6 - raw.scalp_oiliness)),
    dark_patch_locations: raw.dark_patch_locations ?? [],
  };
}

export function parseCheckIn(log: AndrogenLog): AndrogenWeeklyCheckIn | null {
  const s = log.symptoms;
  if (isWeeklyCheckIn(s)) return normalizeCheckIn(s);
  return null;
}

export function serializeCheckIn(checkIn: Omit<AndrogenWeeklyCheckIn, 'version'>): AndrogenWeeklyCheckIn {
  return normalizeCheckIn({
    version: 2,
    hair_shedding: checkIn.hair_shedding,
    acne: checkIn.acne,
    acne_zones: checkIn.acne_zones ?? [],
    body_hair: checkIn.body_hair,
    scalp_oiliness: checkIn.scalp_oiliness,
    scalp_dryness: checkIn.scalp_dryness,
    dark_patches: checkIn.dark_patches,
    dark_patch_locations: checkIn.dark_patch_locations ?? [],
  });
}

export function defaultCheckIn(): Omit<AndrogenWeeklyCheckIn, 'version'> {
  return {
    hair_shedding: 'none',
    acne: 'none',
    acne_zones: [],
    body_hair: 'no_change',
    scalp_oiliness: 3,
    scalp_dryness: 3,
    dark_patches: 'no',
    dark_patch_locations: [],
  };
}

export function weekStartDate(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}
