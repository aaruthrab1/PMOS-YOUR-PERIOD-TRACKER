import type { CareCity } from '@/lib/care/types';
import type { IndiaRegion } from './types';

export interface RegionConfig {
  id: IndiaRegion;
  label: string;
  defaultCity: CareCity;
  cities: CareCity[];
  foodExamples: string[];
  healthTips: string[];
}

export const INDIA_REGIONS: RegionConfig[] = [
  {
    id: 'north',
    label: 'North',
    defaultCity: 'Delhi',
    cities: ['Delhi', 'Jaipur'],
    foodExamples: ['dal-chawal', 'roti-sabzi', 'lassi', 'paratha'],
    healthTips: [
      'Winter dryness can affect skin — stay hydrated and note cycle-linked skin changes.',
      'Heavy festive meals may shift energy — log how you feel after rich foods.',
    ],
  },
  {
    id: 'south',
    label: 'South',
    defaultCity: 'Chennai',
    cities: ['Chennai', 'Bengaluru', 'Hyderabad', 'Kochi'],
    foodExamples: ['idli-dosa', 'sambar-rice', 'curd rice', 'ragi mudde'],
    healthTips: [
      'Fermented foods like curd may support gut comfort — note what helps your digestion.',
      'Hot climates can affect sleep — track bedtime routines that cool you down.',
    ],
  },
  {
    id: 'east',
    label: 'East',
    defaultCity: 'Kolkata',
    cities: ['Kolkata'],
    foodExamples: ['fish-rice', 'mishti', 'poha', 'luchi-alur dom'],
    healthTips: [
      'Monsoon humidity can affect mood and energy — log sleep on rainy weeks.',
      'Iron-rich local foods may support energy — discuss levels with your doctor if tired often.',
    ],
  },
  {
    id: 'west',
    label: 'West',
    defaultCity: 'Mumbai',
    cities: ['Mumbai', 'Pune', 'Ahmedabad'],
    foodExamples: ['thepla', 'vada pav', 'dhokla', 'seafood thali'],
    healthTips: [
      'Fast-paced routines can affect sleep — even 10 minutes of wind-down helps.',
      'Coastal iodine-rich diets are common — mention diet patterns at check-ups.',
    ],
  },
  {
    id: 'central',
    label: 'Central',
    defaultCity: 'Pune',
    cities: ['Pune', 'Ahmedabad', 'Hyderabad'],
    foodExamples: ['poha-jalebi', 'dal bafla', 'bhutte ka kees'],
    healthTips: [
      'Seasonal temperature swings may affect cycle symptoms — track across seasons.',
      'Poha and light breakfasts may suit morning nausea — note what feels gentle.',
    ],
  },
  {
    id: 'northeast',
    label: 'Northeast',
    defaultCity: 'Kolkata',
    cities: ['Kolkata', 'Kochi'],
    foodExamples: ['smoked fish', 'bamboo shoot dishes', 'sticky rice', 'thukpa'],
    healthTips: [
      'Highland climates can affect energy — log sleep when weather shifts sharply.',
      'Traditional fermented foods are common — note digestion and bloating patterns.',
    ],
  },
];

export function getRegionConfig(region: string | null | undefined): RegionConfig | null {
  if (!region) return null;
  return INDIA_REGIONS.find((r) => r.id === region) ?? null;
}

export function defaultCityForRegion(region: string | null | undefined): CareCity {
  return getRegionConfig(region)?.defaultCity ?? 'Delhi';
}

export function regionalFoodPhrase(region: string | null | undefined): string {
  const cfg = getRegionConfig(region);
  if (!cfg) return 'balanced home-cooked meals';
  const foods = cfg.foodExamples.slice(0, 2).join(' or ');
  return `regional staples like ${foods}`;
}

export function pickRegionalTip(region: string | null | undefined, seed = 0): string | null {
  const cfg = getRegionConfig(region);
  if (!cfg?.healthTips.length) return null;
  return cfg.healthTips[seed % cfg.healthTips.length];
}
