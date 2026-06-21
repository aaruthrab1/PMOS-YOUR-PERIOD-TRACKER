export type HairSheddingLevel = 'none' | 'slight' | 'noticeable' | 'significant';
export type AcneLevel = 'none' | 'mild' | 'moderate' | 'significant';
export type BodyHairLevel = 'no_change' | 'slight' | 'noticeable';
export type DarkPatchesLevel = 'no' | 'maybe' | 'yes';
export type AcneZone = 'forehead' | 'cheeks' | 'jawline_chin' | 'nose';
export type DarkPatchLocation = 'neck' | 'underarms' | 'inner_thighs';

export interface AndrogenWeeklyCheckIn {
  version: 2;
  hair_shedding: HairSheddingLevel;
  acne: AcneLevel;
  acne_zones: AcneZone[];
  body_hair: BodyHairLevel;
  scalp_oiliness: number;
  scalp_dryness: number;
  dark_patches: DarkPatchesLevel;
  dark_patch_locations: DarkPatchLocation[];
}

export interface AndrogenTrendPoint {
  date: string;
  label: string;
  phase: string;
  phaseColor: string;
  hairScore: number;
  acneScore: number;
  bodyHairScore: number;
  scalpOiliness: number;
  scalpDryness: number;
  hasAcne: boolean;
  darkPatchScore: number;
}

export interface AndrogenInsight {
  id: string;
  text: string;
  category?: 'hair' | 'skin' | 'facial_hair' | 'scalp' | 'patches' | 'general';
  priority?: number;
}

export type TrendDirection = 'up' | 'down' | 'stable';

export interface WeeklyChange {
  direction: TrendDirection;
  label: string;
  delta: number;
}

export interface ZoneFrequency {
  zone: AcneZone;
  label: string;
  count: number;
  pct: number;
}

export interface LocationFrequency {
  location: DarkPatchLocation;
  label: string;
  count: number;
  pct: number;
}

export interface AndrogenIntelligence {
  hair: {
    trendPoints: AndrogenTrendPoint[];
    weeklyChange: WeeklyChange;
    avgSeverity: number;
    peakPhase: string | null;
  };
  skin: {
    trendPoints: AndrogenTrendPoint[];
    zoneFrequency: ZoneFrequency[];
    weeklyChange: WeeklyChange;
    hormonalPattern: 'jawline_cycle' | 'luteal_acne' | 'stable' | null;
  };
  facialHair: {
    trendPoints: AndrogenTrendPoint[];
    weeklyChange: WeeklyChange;
    progressLabel: string;
  };
  scalp: {
    oilinessPoints: AndrogenTrendPoint[];
    drynessPoints: AndrogenTrendPoint[];
    oilinessChange: WeeklyChange;
    drynessChange: WeeklyChange;
  };
  darkPatches: {
    locationFrequency: LocationFrequency[];
    reportedWeeks: number;
    coOccurrenceNote: string | null;
  };
}
