import type {
  HairSheddingLevel,
  AcneLevel,
  BodyHairLevel,
  DarkPatchesLevel,
  AcneZone,
  DarkPatchLocation,
} from './types';

export interface LabeledOption<T extends string> {
  value: T;
  label: string;
  simpleLabel: string;
}

export const HAIR_SHEDDING_OPTIONS: LabeledOption<HairSheddingLevel>[] = [
  { value: 'none', label: 'No unusual shedding', simpleLabel: 'No extra hair falling out' },
  { value: 'slight', label: 'Slight increase in shedding', simpleLabel: 'A little more hair falling out' },
  { value: 'noticeable', label: 'Noticeably more shedding', simpleLabel: 'Clearly more hair falling out' },
  { value: 'significant', label: 'Significant thinning', simpleLabel: 'Hair feels much thinner' },
];

export const ACNE_OPTIONS: LabeledOption<AcneLevel>[] = [
  { value: 'none', label: 'None', simpleLabel: 'None' },
  { value: 'mild', label: 'Mild', simpleLabel: 'A few spots' },
  { value: 'moderate', label: 'Moderate', simpleLabel: 'Several breakouts' },
  { value: 'significant', label: 'Significant', simpleLabel: 'Many breakouts' },
];

export const BODY_HAIR_OPTIONS: LabeledOption<BodyHairLevel>[] = [
  { value: 'no_change', label: 'No change', simpleLabel: 'No change' },
  { value: 'slight', label: 'Slight increase', simpleLabel: 'A little more' },
  { value: 'noticeable', label: 'Noticeable increase', simpleLabel: 'Clearly more' },
];

export const DARK_PATCHES_OPTIONS: LabeledOption<DarkPatchesLevel>[] = [
  { value: 'no', label: 'No', simpleLabel: 'No' },
  { value: 'maybe', label: 'Maybe', simpleLabel: 'Maybe — not sure' },
  { value: 'yes', label: 'Yes', simpleLabel: 'Yes' },
];

export const ACNE_ZONE_OPTIONS: { id: AcneZone; label: string; simpleLabel: string }[] = [
  { id: 'forehead', label: 'Forehead', simpleLabel: 'Forehead' },
  { id: 'cheeks', label: 'Cheeks', simpleLabel: 'Cheeks' },
  { id: 'jawline_chin', label: 'Jawline and Chin', simpleLabel: 'Jaw and chin' },
  { id: 'nose', label: 'Nose', simpleLabel: 'Nose' },
];

export const DARK_PATCH_LOCATION_OPTIONS: { id: DarkPatchLocation; label: string; simpleLabel: string }[] = [
  { id: 'neck', label: 'Neck', simpleLabel: 'Neck' },
  { id: 'underarms', label: 'Underarms', simpleLabel: 'Underarms' },
  { id: 'inner_thighs', label: 'Inner thighs', simpleLabel: 'Inner thighs' },
];

export const HAIR_SCORES: Record<HairSheddingLevel, number> = {
  none: 0,
  slight: 1,
  noticeable: 2,
  significant: 3,
};

export const ACNE_SCORES: Record<AcneLevel, number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  significant: 3,
};

export const BODY_HAIR_SCORES: Record<BodyHairLevel, number> = {
  no_change: 0,
  slight: 1,
  noticeable: 2,
};

export const DARK_PATCHES_SCORES: Record<DarkPatchesLevel, number> = {
  no: 0,
  maybe: 1,
  yes: 2,
};

export const DARK_PATCHES_EDUCATION = {
  medical:
    'Dark skin patches (sometimes called acanthosis nigricans) may appear as velvety, darker areas — often on the neck, underarms, or skin folds. They can be linked to insulin resistance and hormonal shifts. If you notice them, mention them to your clinician.',
  simple:
    'Some people notice darker, velvety patches on the neck, underarms, or skin folds. This can happen with hormone and blood-sugar changes. If you see them, it\'s okay to bring it up with your doctor.',
};

export const SIMPLE_LANGUAGE_KEY = 'cyra_androgen_simple_language';

export function getOptionLabel<T extends string>(
  options: LabeledOption<T>[],
  value: T,
  simple: boolean,
): string {
  const opt = options.find((o) => o.value === value);
  if (!opt) return value;
  return simple ? opt.simpleLabel : opt.label;
}
