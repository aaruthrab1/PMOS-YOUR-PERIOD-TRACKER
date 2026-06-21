export const COMMON_SYMPTOMS = [
  { name: 'Bloating', category: 'digestive' as const },
  { name: 'Breast tenderness', category: 'physical' as const },
  { name: 'Headache', category: 'physical' as const },
  { name: 'Fatigue', category: 'energy' as const },
  { name: 'Mood swings', category: 'emotional' as const },
  { name: 'Anxiety', category: 'emotional' as const },
  { name: 'Irritability', category: 'emotional' as const },
  { name: 'Brain fog', category: 'cognitive' as const },
  { name: 'Insomnia', category: 'sleep' as const },
  { name: 'Cramping', category: 'physical' as const },
  { name: 'Acne', category: 'skin' as const },
  { name: 'Food cravings', category: 'digestive' as const },
];

export const TRACKER_MOOD_OPTIONS = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'irritable', label: 'Irritable', emoji: '😤' },
  { value: 'exhausted', label: 'Exhausted', emoji: '😩' },
] as const;

export const FLOW_OPTIONS = [
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
] as const;

export const MOOD_OPTIONS = [
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'irritable', label: 'Irritable', emoji: '😤' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'energetic', label: 'Energetic', emoji: '⚡' },
  { value: 'foggy', label: 'Foggy', emoji: '🌫️' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
] as const;

export const CYCLE_PHASES = [
  { value: 'menstrual', label: 'Menstrual' },
  { value: 'follicular', label: 'Follicular' },
  { value: 'ovulation', label: 'Ovulation' },
  { value: 'luteal', label: 'Luteal' },
  { value: 'unknown', label: 'Unknown' },
] as const;

export const SEVERITY_OPTIONS = [
  { value: 'none', label: 'None', color: 'bg-gray-200' },
  { value: 'mild', label: 'Mild', color: 'bg-sage-200' },
  { value: 'moderate', label: 'Moderate', color: 'bg-amber-200' },
  { value: 'severe', label: 'Severe', color: 'bg-red-200' },
] as const;

export const ARTICLE_CATEGORIES: Record<string, string> = {
  pmos_basics: 'PMOS Basics',
  symptom_management: 'Symptom Management',
  nutrition: 'Nutrition',
  mental_health: 'Mental Health',
  doctor_prep: 'Doctor Prep',
  lifestyle: 'Lifestyle',
  research: 'Research',
};

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}