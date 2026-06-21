export type CyraLanguageCode =
  | 'en'
  | 'hi'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'pa';

export type SakhiLanguageName =
  | 'English'
  | 'Hindi'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'
  | 'Bengali'
  | 'Marathi'
  | 'Gujarati'
  | 'Punjabi';

export type IndiaRegion =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'central'
  | 'northeast';

export interface DualCopy {
  medical: string;
  simple: string;
}

export interface PersonalizationState {
  language: CyraLanguageCode;
  simpleLanguage: boolean;
  region: IndiaRegion | null;
}

export interface SmartPersonalizationInput {
  ageRange?: string | null;
  region?: IndiaRegion | null;
  conditions?: string[];
  commonSymptoms?: string[];
  cyclePhase?: string | null;
  cycleDay?: number | null;
  healthGoals?: string[];
  language: CyraLanguageCode;
  simpleLanguage: boolean;
}
