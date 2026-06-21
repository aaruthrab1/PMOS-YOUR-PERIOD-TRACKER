import type { QuizQuestion } from './types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'welcome',
    title: "Hi — let's learn about your health together",
    subtitle: 'This takes about 2 minutes. There are no wrong answers.',
    encouragement: "I'm Sakhi. I'll ask a few gentle questions so Cyra can personalize your experience.",
    whyWeAsk:
      'Understanding your goals and patterns helps us surface insights that are actually useful — not generic health tips.',
    multi: false,
    optional: true,
    illustration: 'welcome',
    options: [],
  },
  {
    id: 'goals',
    title: 'What brings you to Cyra?',
    subtitle: 'Select everything that resonates.',
    encouragement: 'Many people come here for more than one reason — that is completely normal.',
    whyWeAsk:
      'Your goals shape which insights, reminders, and tracker views we prioritize on your dashboard.',
    multi: true,
    illustration: 'goals',
    options: [
      { value: 'cycle_patterns', label: 'Understand my cycle patterns' },
      { value: 'pmos', label: 'Track PMOS symptoms' },
      { value: 'doctor_prep', label: 'Prepare for doctor visits' },
      { value: 'mood_energy', label: 'Manage mood & energy' },
      { value: 'hormonal_health', label: 'Learn about hormonal health' },
      { value: 'androgen', label: 'Monitor androgen-related symptoms' },
    ],
  },
  {
    id: 'conditions',
    title: 'Anything we should keep in mind?',
    subtitle: 'Select any that apply — or skip if none.',
    encouragement: 'You can update this anytime. It stays private to your account.',
    whyWeAsk:
      'Known conditions help us tailor language and suggestions without making assumptions about your diagnosis.',
    multi: true,
    optional: true,
    illustration: 'conditions',
    options: [
      { value: 'pmos', label: 'PMOS / PMS' },
      { value: 'pcos', label: 'PCOS' },
      { value: 'endometriosis', label: 'Endometriosis' },
      { value: 'irregular', label: 'Irregular cycles' },
      { value: 'androgens', label: 'High androgens' },
      { value: 'exploring', label: 'None — just exploring' },
    ],
  },
  {
    id: 'cycle_regularity',
    title: 'How regular does your cycle feel?',
    subtitle: 'A rough estimate is perfectly fine.',
    encouragement: 'Cycles naturally vary — especially during stress, travel, or life changes.',
    whyWeAsk:
      'Regularity helps us spot meaningful shifts versus normal variation when you log over time.',
    multi: false,
    illustration: 'cycle',
    options: [
      { value: 'very_regular', label: 'Very regular (±2 days)' },
      { value: 'mostly_regular', label: 'Mostly regular (±5 days)' },
      { value: 'somewhat_irregular', label: 'Somewhat irregular' },
      { value: 'very_irregular', label: 'Very irregular or absent' },
      { value: 'unsure', label: 'Not sure yet' },
    ],
  },
  {
    id: 'cycle_length',
    title: 'About how long is your typical cycle?',
    subtitle: 'Count from the first day of one period to the day before the next.',
    encouragement: 'If you are not sure, pick your best guess — logging will make this clearer.',
    whyWeAsk:
      'Cycle length helps us understand patterns that may be worth tracking — like energy dips or mood shifts before your period.',
    multi: false,
    illustration: 'cycle',
    options: [
      { value: '21-25', label: '21–25 days' },
      { value: '26-30', label: '26–30 days' },
      { value: '31-35', label: '31–35 days' },
      { value: '36+', label: '36 days or longer' },
      { value: 'unsure', label: 'I am not sure' },
    ],
  },
  {
    id: 'energy',
    title: 'On a typical day, how is your energy?',
    subtitle: 'Think about an average day — not your best or worst.',
    encouragement: 'Energy often connects to sleep, cycle phase, and stress. We will help you see those links.',
    whyWeAsk:
      'Energy patterns alongside your cycle can reveal when you might need extra rest or support.',
    multi: false,
    illustration: 'energy',
    slider: { min: 1, max: 10, labels: ['Low', 'High'] },
  },
  {
    id: 'symptoms',
    title: 'Which symptoms do you notice regularly?',
    subtitle: 'Optional — select any that feel familiar.',
    encouragement: 'Naming symptoms is a form of self-advocacy. You do not need a diagnosis for them to matter.',
    whyWeAsk:
      'Tracking symptoms over time helps you and your clinician see patterns — not isolated bad days.',
    multi: true,
    optional: true,
    illustration: 'symptoms',
    options: [
      { value: 'fatigue', label: 'Fatigue' },
      { value: 'mood', label: 'Mood changes' },
      { value: 'cramps', label: 'Cramps or pain' },
      { value: 'acne', label: 'Acne or skin changes' },
      { value: 'hair', label: 'Hair changes' },
      { value: 'sleep', label: 'Sleep issues' },
      { value: 'bloating', label: 'Bloating' },
    ],
  },
  {
    id: 'tracking',
    title: 'Have you tracked symptoms before?',
    subtitle: 'This helps us meet you where you are.',
    encouragement: 'Whether you are new or experienced, Cyra adapts to your rhythm.',
    whyWeAsk:
      'We adjust how much guidance and structure we offer based on your comfort with tracking.',
    multi: false,
    illustration: 'tracking',
    options: [
      { value: 'consistent', label: 'Yes, consistently' },
      { value: 'inconsistent', label: 'Yes, but on and off' },
      { value: 'tried_stopped', label: 'Tried apps but stopped' },
      { value: 'first_time', label: 'This is my first time' },
    ],
  },
];

/** Steps shown in progress (excludes welcome tap-through) */
export const QUIZ_PROGRESS_STEPS = QUIZ_QUESTIONS.filter((q) => q.id !== 'welcome');

export const QUIZ_STORAGE_KEY = 'cyra_health_quiz_progress';
