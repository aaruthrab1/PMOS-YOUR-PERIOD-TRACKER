import type { DetectedPattern } from './patterns';
import type { HealthSnapshot } from './healthSnapshot';

export type PatternLevelId = 'building' | 'stable' | 'watching' | 'active';

export interface PatternLevel {
  id: PatternLevelId;
  label: string;
  description: string;
}

export function computePatternLevel(
  patterns: DetectedPattern[],
  health: HealthSnapshot,
  daysLogged: number,
): PatternLevel {
  if (daysLogged < 3 && !health.hasData) {
    return {
      id: 'building',
      label: 'Building baseline',
      description: 'Log a few days to unlock pattern detection',
    };
  }

  const strong = patterns.filter((p) => p.strength === 'strong').length;
  const moderate = patterns.filter((p) => p.strength === 'moderate').length;

  if (strong >= 2 || (strong >= 1 && moderate >= 1)) {
    return {
      id: 'active',
      label: 'Active patterns',
      description: 'Clear trends detected across your recent logs',
    };
  }

  if (moderate >= 1 || patterns.some((p) => p.strength === 'emerging')) {
    return {
      id: 'watching',
      label: 'Patterns emerging',
      description: 'Early signals worth tracking this week',
    };
  }

  if (health.risk === 'low' || health.score >= 70) {
    return {
      id: 'stable',
      label: 'Stable',
      description: 'Your recent logs look balanced',
    };
  }

  return {
    id: 'watching',
    label: 'Worth monitoring',
    description: 'Keep logging to refine your health picture',
  };
}
