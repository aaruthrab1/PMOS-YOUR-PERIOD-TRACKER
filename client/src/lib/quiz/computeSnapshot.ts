import type { QuizAnswers, QuizFocusArea, QuizHealthSnapshot, QuizNextAction } from './types';

function has(answers: QuizAnswers, key: keyof QuizAnswers, value: string): boolean {
  return (answers[key] ?? []).includes(value);
}

function countSelected(answers: QuizAnswers, key: keyof QuizAnswers): number {
  return (answers[key] ?? []).length;
}

export function computeQuizHealthSnapshot(answers: QuizAnswers): QuizHealthSnapshot {
  const energyRaw = answers.energy?.[0];
  const energy = energyRaw ? Number(energyRaw) : 5;
  const symptomCount = countSelected(answers, 'symptoms');
  const irregular =
    has(answers, 'cycle_regularity', 'somewhat_irregular') ||
    has(answers, 'cycle_regularity', 'very_irregular');
  const longCycle = has(answers, 'cycle_length', '36+');
  const firstTime = has(answers, 'tracking', 'first_time');
  const doctorPrep = has(answers, 'goals', 'doctor_prep');
  const pmosGoal = has(answers, 'goals', 'pmos');
  const hasPcos = has(answers, 'conditions', 'pcos');
  const exploring = has(answers, 'conditions', 'exploring');

  let score = 55 + energy * 3;
  if (!irregular) score += 8;
  if (symptomCount <= 2) score += 6;
  if (has(answers, 'tracking', 'consistent')) score += 5;
  score = Math.max(38, Math.min(92, Math.round(score)));

  const insights: string[] = [];

  if (pmosGoal || has(answers, 'conditions', 'pmos')) {
    insights.push('PMOS-related patterns are a focus — mood and energy logs will be especially helpful.');
  }
  if (irregular || longCycle) {
    insights.push('Your cycle timing may vary — consistent period logging will sharpen your insights over 2–3 cycles.');
  } else {
    insights.push('Your cycle rhythm gives us a solid baseline for spotting meaningful changes.');
  }
  if (energy <= 4) {
    insights.push('Lower energy days are worth tracking alongside sleep — many people see links to cycle phase.');
  } else if (energy >= 7) {
    insights.push('Your energy baseline looks steady — tracking will show how it shifts across your cycle.');
  }
  if (symptomCount >= 3) {
    insights.push(`You named ${symptomCount} recurring symptoms — logging them weekly helps reveal patterns, not noise.`);
  } else if (symptomCount === 0) {
    insights.push('You can add symptoms anytime in the tracker as you notice them.');
  }

  const focusAreas: QuizFocusArea[] = [];

  if (irregular || longCycle) {
    focusAreas.push({
      id: 'cycle',
      label: 'Cycle patterns',
      description: 'Log period start dates to build a clearer picture of length and regularity.',
    });
  }
  if (symptomCount > 0 || pmosGoal) {
    focusAreas.push({
      id: 'symptoms',
      label: 'Symptom tracking',
      description: 'Brief daily logs help connect symptoms to cycle phase and lifestyle.',
    });
  }
  if (energy <= 5 || has(answers, 'symptoms', 'sleep')) {
    focusAreas.push({
      id: 'rest',
      label: 'Rest & recovery',
      description: 'Sleep and energy together often explain how you feel day to day.',
    });
  }
  if (hasPcos || has(answers, 'conditions', 'androgens')) {
    focusAreas.push({
      id: 'androgen',
      label: 'Hormone-related symptoms',
      description: 'Weekly check-ins for skin, hair, and scalp changes can reveal trends.',
    });
  }
  if (focusAreas.length === 0) {
    focusAreas.push({
      id: 'baseline',
      label: 'Build your baseline',
      description: 'A few days of logging unlocks personalized insights on your dashboard.',
    });
  }

  let headline = 'Your health snapshot';
  let summary =
    'This is a starting point — not a diagnosis. Cyra will refine these insights as you log.';

  if (score >= 72 && !irregular && symptomCount <= 2) {
    headline = 'A balanced starting point';
    summary =
      'Your answers suggest a steady baseline. Tracking will help you notice subtle shifts early.';
  } else if (irregular || symptomCount >= 4) {
    headline = 'Patterns worth exploring together';
    summary =
      'Several areas could benefit from gentle tracking — many people in similar situations find clarity within a few cycles.';
  } else {
    headline = 'Your personalized starting snapshot';
    summary =
      'We have enough to personalize your dashboard. The more you log, the more specific your insights become.';
  }

  const nextActions: QuizNextAction[] = [
    {
      id: 'tracker',
      label: 'Start logging today',
      description: firstTime ? 'Quick 30-second daily check-ins' : 'Pick up where you left off',
      href: '/tracker',
      primary: true,
    },
    {
      id: 'care',
      label: 'Begin your health journey',
      description: 'Step-by-step guidance for doctor visits and tests',
      href: '/care',
      primary: !firstTime && doctorPrep,
    },
    {
      id: 'chat',
      label: 'Ask Sakhi anything',
      description: 'Get answers in plain language',
      href: '/chat',
    },
    {
      id: 'dashboard',
      label: 'View your dashboard',
      description: 'See your snapshot and weekly insights',
      href: '/dashboard',
    },
  ];

  if (exploring && focusAreas.length === 1) {
    insights.push('You are exploring — Cyra will learn alongside you without pressure to label anything.');
  }

  return {
    score,
    headline,
    summary,
    insights: insights.slice(0, 4),
    focusAreas: focusAreas.slice(0, 3),
    nextActions,
  };
}

export function quizAnswersToProfilePatch(answers: QuizAnswers): {
  profile: {
    health_goals: string[];
    conditions: string[];
    cycle_regularity: string | null;
    common_symptoms: string[];
    energy_level: number | null;
  };
  preferences: {
    cycle_length_avg: number;
  };
} {
  const goalLabels: Record<string, string> = {
    cycle_patterns: 'Understand my cycle patterns',
    pmos: 'Track PMOS symptoms',
    doctor_prep: 'Prepare for doctor visits',
    mood_energy: 'Manage mood & energy',
    hormonal_health: 'Learn about hormonal health',
    androgen: 'Monitor androgen-related symptoms',
  };

  const conditionLabels: Record<string, string> = {
    pmos: 'PMOS / PMS',
    pcos: 'PCOS',
    endometriosis: 'Endometriosis',
    irregular: 'Irregular cycles',
    androgens: 'High androgens',
  };

  const regularityLabels: Record<string, string> = {
    very_regular: 'Very regular',
    mostly_regular: 'Mostly regular',
    somewhat_irregular: 'Somewhat irregular',
    very_irregular: 'Very irregular or absent',
    unsure: 'Not sure',
  };

  const goals = (answers.goals ?? []).map((g) => goalLabels[g] ?? g);
  const conditions = (answers.conditions ?? [])
    .filter((c) => c !== 'exploring')
    .map((c) => conditionLabels[c] ?? c);

  const cycleRegularity = answers.cycle_regularity?.[0]
    ? regularityLabels[answers.cycle_regularity[0]] ?? answers.cycle_regularity[0]
    : undefined;

  let cycleLengthAvg = 28;
  const len = answers.cycle_length?.[0];
  if (len === '21-25') cycleLengthAvg = 23;
  else if (len === '26-30') cycleLengthAvg = 28;
  else if (len === '31-35') cycleLengthAvg = 33;
  else if (len === '36+') cycleLengthAvg = 38;

  const symptomLabels: Record<string, string> = {
    fatigue: 'Fatigue',
    mood: 'Mood changes',
    cramps: 'Cramps or pain',
    acne: 'Acne or skin changes',
    hair: 'Hair changes',
    sleep: 'Sleep issues',
    bloating: 'Bloating',
  };

  const commonSymptoms = (answers.symptoms ?? []).map((s) => symptomLabels[s] ?? s);
  const energyLevel = answers.energy?.[0] ? Number(answers.energy[0]) : null;

  return {
    profile: {
      health_goals: goals,
      conditions,
      cycle_regularity: cycleRegularity ?? null,
      common_symptoms: commonSymptoms,
      energy_level: energyLevel,
    },
    preferences: {
      cycle_length_avg: cycleLengthAvg,
    },
  };
}
