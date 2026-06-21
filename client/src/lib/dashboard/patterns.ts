import type { DailyTrend } from '@/types/database';
import type { CycleForecast } from './cycleForecast';

export interface DetectedPattern {
  id: string;
  title: string;
  description: string;
  type: 'energy' | 'sleep' | 'mood';
  strength: 'strong' | 'moderate' | 'emerging';
}

function correlateSleepMood(trends: DailyTrend[]): DetectedPattern | null {
  const paired = trends.filter((t) => t.sleepHours != null && t.mood);
  if (paired.length < 5) return null;

  const goodSleep = paired.filter((t) => (t.sleepHours ?? 0) >= 7);
  const poorSleep = paired.filter((t) => (t.sleepHours ?? 0) < 6.5);
  if (goodSleep.length < 2 || poorSleep.length < 2) return null;

  const positiveMoods = new Set(['calm', 'happy', 'energetic', 'neutral']);
  const goodMoodRate = goodSleep.filter((t) => positiveMoods.has(t.mood)).length / goodSleep.length;
  const poorMoodRate = poorSleep.filter((t) => positiveMoods.has(t.mood)).length / poorSleep.length;

  if (goodMoodRate - poorMoodRate >= 0.25) {
    return {
      id: 'sleep-mood-link',
      title: 'Sleep & mood',
      description: 'Longer sleep is linked with better mood in your logs.',
      type: 'mood',
      strength: goodMoodRate - poorMoodRate >= 0.4 ? 'strong' : 'moderate',
    };
  }
  return null;
}

export function detectPatterns(
  trends: DailyTrend[],
  cycle: CycleForecast,
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  if (trends.length < 3 && !cycle.hasData) return patterns;

  const recent = trends.slice(-21);
  const energies = recent.filter((t) => t.energyLevel != null).map((t) => t.energyLevel!);
  const sleeps = recent.filter((t) => t.sleepHours != null).map((t) => t.sleepHours!);

  // Premenstrual energy drop — natural language
  if (cycle.hasData && cycle.daysUntilNextPeriod != null && cycle.daysUntilNextPeriod <= 7) {
    const daysBefore = Math.min(7, Math.max(2, 7 - cycle.daysUntilNextPeriod + 1));
    if (energies.length >= 3) {
      const avg = energies.reduce((a, b) => a + b, 0) / energies.length;
      if (avg < 5.5 || cycle.phase === 'Luteal') {
        patterns.push({
          id: 'energy-premenstrual',
          title: 'Energy before your period',
          description: `Your energy tends to drop about ${daysBefore} days before your period.`,
          type: 'energy',
          strength: avg < 4 ? 'strong' : 'moderate',
        });
      }
    } else if (cycle.phase === 'Luteal') {
      patterns.push({
        id: 'energy-premenstrual',
        title: 'Energy before your period',
        description: 'Your energy tends to drop a few days before your period — common in the luteal phase.',
        type: 'energy',
        strength: 'emerging',
      });
    }
  } else if (cycle.phase === 'Luteal' && energies.length >= 3) {
    const avg = energies.reduce((a, b) => a + b, 0) / energies.length;
    if (avg < 5.5) {
      patterns.push({
        id: 'energy-luteal',
        title: 'Energy in luteal phase',
        description: `Your energy averaged ${avg.toFixed(1)}/10 recently — often lower before your period.`,
        type: 'energy',
        strength: avg < 4 ? 'strong' : 'moderate',
      });
    }
  }

  const sleepMood = correlateSleepMood(recent);
  if (sleepMood) patterns.push(sleepMood);

  if (sleeps.length >= 5 && !patterns.some((p) => p.id === 'sleep-mood-link')) {
    const avg = sleeps.reduce((a, b) => a + b, 0) / sleeps.length;
    if (avg < 6.5) {
      patterns.push({
        id: 'sleep-low',
        title: 'Sleep duration',
        description: `You're averaging ${avg.toFixed(1)}h — longer sleep may help mood and energy.`,
        type: 'sleep',
        strength: avg < 6 ? 'strong' : 'moderate',
      });
    }
  }

  const moodCounts: Record<string, number> = {};
  for (const t of recent) {
    if (t.mood) moodCounts[t.mood] = (moodCounts[t.mood] ?? 0) + 1;
  }
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  if (topMood && ['anxious', 'irritable', 'sad'].includes(topMood[0]) && topMood[1] >= 3) {
    patterns.push({
      id: 'mood-trend',
      title: 'Mood pattern',
      description: `${topMood[0].charAt(0).toUpperCase() + topMood[0].slice(1)} mood has shown up often — tracking triggers can help.`,
      type: 'mood',
      strength: topMood[1] >= 5 ? 'strong' : 'moderate',
    });
  }

  if (patterns.length === 0 && trends.length >= 2) {
    patterns.push({
      id: 'building',
      title: 'Patterns forming',
      description: 'Keep logging a few more days — Cyra will connect sleep, mood, and your cycle.',
      type: 'mood',
      strength: 'emerging',
    });
  }

  return patterns.slice(0, 3);
}
