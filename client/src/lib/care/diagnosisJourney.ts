import type { JourneyStepContent, JourneyStepId, JourneyStepState } from './types';

export const JOURNEY_STEPS: JourneyStepContent[] = [
  {
    id: 'symptoms_noticed',
    order: 1,
    title: 'Symptoms noticed',
    subtitle: 'You recognized something felt different',
    guidance:
      'Start here — naming what you feel is the first step toward answers. You do not need a diagnosis to take your experience seriously.',
    whatToExpect:
      'Many people first notice cycle changes, mood shifts, skin or hair changes, fatigue, or pain. Even a few weeks of tracking helps you describe patterns clearly when you speak to a clinician.',
    whatToAsk: [
      'Could these symptoms be connected to my cycle or hormones?',
      'What should I track before my first appointment?',
      'When should I seek care urgently versus scheduling a routine visit?',
    ],
    questionsForDoctor: [
      'When did symptoms start, and how often do they occur?',
      'Which symptoms affect daily life most?',
      'Any recent stress, medication, or lifestyle changes?',
      'Does anyone in your family have similar symptoms?',
    ],
    actions: [
      { type: 'symptom_summary', label: 'Build symptom summary' },
      { type: 'visit_checklist', label: 'First visit checklist' },
    ],
  },
  {
    id: 'doctor_visited',
    order: 2,
    title: 'Doctor visited',
    subtitle: 'You took the step to get professional guidance',
    guidance:
      'This is often the hardest step — and you did it. Use your logs and this prep to walk in feeling clear and confident.',
    whatToExpect:
      'A first visit usually includes history questions, a physical exam, and discussion of next steps. It is okay to ask for plain language, take notes, and bring someone for support.',
    whatToAsk: [
      'What conditions are you considering based on my symptoms?',
      'What tests do you recommend and why?',
      'When should I follow up, and who do I contact with questions?',
    ],
    questionsForDoctor: [
      'Your symptom timeline with dates and severity',
      'Your goals — cycle regulation, fertility, mood support, pain relief',
      'All medications and supplements you currently take',
      'What you understood from the visit (to confirm accuracy)',
    ],
    actions: [
      { type: 'appointment_prep', label: 'Generate appointment prep' },
      { type: 'visit_checklist', label: 'Generate visit checklist' },
    ],
  },
  {
    id: 'blood_tests',
    order: 3,
    title: 'Blood tests',
    subtitle: 'Hormone and metabolic labs',
    guidance:
      'Labs are often timed to your cycle — ask which day to test and whether fasting is needed. Your Cyra logs can help you remember cycle day.',
    whatToExpect:
      'Blood tests may include hormones (LH, FSH, testosterone), thyroid (TSH), and metabolic markers (fasting insulin, glucose). Results usually take a few days. Some tests must be done on specific cycle days.',
    whatToAsk: [
      'Which day of my cycle should I do this test?',
      'Do I need to fast, and for how long?',
      'When will results be ready, and who explains them?',
      'What do abnormal results mean for next steps?',
    ],
    questionsForDoctor: [
      'The date and cycle day when blood was drawn',
      'Whether you were on birth control or other hormones at the time',
      'Any difficulty getting the test done (cost, access, timing)',
    ],
    actions: [{ type: 'test_checklist', label: 'Generate test checklist' }],
  },
  {
    id: 'ultrasound',
    order: 4,
    title: 'Ultrasound',
    subtitle: 'Pelvic imaging when recommended',
    guidance:
      'An ultrasound helps assess ovaries and uterine lining. You can ask for a chaperone, explain any discomfort, and request a copy of your report.',
    whatToExpect:
      'A pelvic ultrasound is often transabdominal or transvaginal. The procedure is usually brief. You should receive a written report — keep it for follow-up visits.',
    whatToAsk: [
      'What will this ultrasound show that blood tests cannot?',
      'Will I receive images or a written report?',
      'Are there alternatives if I am uncomfortable with the procedure?',
      'When should I schedule it relative to my period?',
    ],
    questionsForDoctor: [
      'When the scan was done relative to your last period',
      'Any pain or concerns during the procedure',
      'Whether results matched what you were experiencing',
    ],
    actions: [{ type: 'scan_checklist', label: 'Generate scan checklist' }],
  },
  {
    id: 'care_plan',
    order: 5,
    title: 'Care plan',
    subtitle: 'You and your clinician agreed on next steps',
    guidance:
      'A care plan can evolve — checking in at follow-ups is normal. Track how you respond and note side effects or barriers honestly.',
    whatToExpect:
      'Your plan may include lifestyle support, medications, follow-up tests, or referrals. Ask what to expect in the first 4–6 weeks and when to seek help sooner.',
    whatToAsk: [
      'What should I expect in the first 4–6 weeks?',
      'What side effects should I watch for?',
      'When is my next follow-up, and what should I track until then?',
      'What if this plan does not help — what are the alternatives?',
    ],
    questionsForDoctor: [
      'How you are responding to the plan so far',
      'Any new symptoms since starting treatment',
      'Barriers to following the plan (cost, schedule, side effects)',
      'Your updated goals and priorities',
    ],
    actions: [{ type: 'care_plan_checklist', label: 'Generate follow-up checklist' }],
  },
];

/** @deprecated Use JOURNEY_STEPS */
export const DIAGNOSIS_STEPS = JOURNEY_STEPS;

export function defaultStepState(): JourneyStepState {
  return { completed: false, completedDate: null, notes: '' };
}

export function createEmptyProgress(): Record<JourneyStepId, JourneyStepState> {
  return Object.fromEntries(
    JOURNEY_STEPS.map((s) => [s.id, defaultStepState()]),
  ) as Record<JourneyStepId, JourneyStepState>;
}

export const CARE_CITIES = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Kochi',
] as const;

/** Map legacy 7-step progress to the current 5-step journey */
export function migrateLegacyProgress(
  legacySteps: Record<string, JourneyStepState | undefined>,
): Record<JourneyStepId, JourneyStepState> {
  const empty = createEmptyProgress();
  const merge = (target: JourneyStepId, source: JourneyStepState | undefined) => {
    if (!source) return;
    const t = empty[target];
    if (source.completed) {
      t.completed = true;
      if (source.completedDate && (!t.completedDate || source.completedDate > t.completedDate)) {
        t.completedDate = source.completedDate;
      }
    }
    if (source.notes) {
      t.notes = t.notes ? `${t.notes}\n${source.notes}` : source.notes;
    }
  };

  merge('symptoms_noticed', legacySteps.noticed_symptoms ?? legacySteps.symptoms_noticed);
  merge('symptoms_noticed', legacySteps.spoke_trusted);
  merge('doctor_visited', legacySteps.visited_doctor ?? legacySteps.doctor_visited);
  merge('blood_tests', legacySteps.blood_tests);
  merge('ultrasound', legacySteps.ultrasound);
  merge('care_plan', legacySteps.received_assessment);
  merge('care_plan', legacySteps.care_plan);

  return empty;
}

export function findCurrentStepId(
  steps: Record<JourneyStepId, JourneyStepState>,
): JourneyStepId {
  const next = JOURNEY_STEPS.find((s) => !steps[s.id]?.completed);
  return next?.id ?? JOURNEY_STEPS[JOURNEY_STEPS.length - 1].id;
}

export function journeyEncouragement(completedCount: number): string {
  if (completedCount === 0) {
    return 'Every journey starts with noticing. You are in the right place.';
  }
  if (completedCount >= JOURNEY_STEPS.length) {
    return 'You have walked the full path — keep tracking and adjusting with your clinician.';
  }
  const messages = [
    'Naming your experience is a powerful first step.',
    'Seeking care takes courage — you are doing the work.',
    'Labs bring clarity — timing and preparation matter.',
    'Imaging adds another piece to your picture.',
    'A care plan is a partnership — you belong in the conversation.',
  ];
  return messages[Math.min(completedCount, messages.length - 1)];
}
