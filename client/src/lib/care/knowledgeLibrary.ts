import type { LucideIcon } from 'lucide-react';
import {
  Heart,
  RefreshCw,
  FlaskConical,
  Leaf,
  Baby,
  Stethoscope,
} from 'lucide-react';

export interface KnowledgeTopic {
  id: string;
  title: string;
  teaser: string;
  readMinutes: number;
  icon: LucideIcon;
  /** Optional slug for Supabase article */
  articleSlug?: string;
  bullets: string[];
}

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    id: 'pmos',
    title: 'What is PMOS?',
    teaser: 'Premenstrual syndrome amplified — patterns, not a character flaw.',
    readMinutes: 4,
    icon: Heart,
    articleSlug: 'understanding-pmos',
    bullets: [
      'PMOS describes severe premenstrual symptoms that affect daily life.',
      'Hormone shifts in the luteal phase often drive mood, sleep, and skin changes.',
      'Tracking helps you show clinicians clear patterns over time.',
    ],
  },
  {
    id: 'cycle-basics',
    title: 'Cycle Basics',
    teaser: 'Phases, length, and what "normal" really means for you.',
    readMinutes: 5,
    icon: RefreshCw,
    bullets: [
      'A cycle runs from day 1 of bleeding to the day before the next period.',
      'Typical length is 21–35 days; longer cycles are common with PCOS.',
      'Phase-aware logging reveals when symptoms cluster.',
    ],
  },
  {
    id: 'hormones',
    title: 'Hormones Explained',
    teaser: 'Estrogen, progesterone, and androgens in plain language.',
    readMinutes: 6,
    icon: FlaskConical,
    bullets: [
      'Estrogen rises in the follicular phase; progesterone dominates after ovulation.',
      'Androgens influence skin, hair, and scalp — especially in PCOS.',
      'Labs are often timed to specific cycle days for accuracy.',
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Support',
    teaser: 'Sleep, movement, and nutrition that support hormone balance.',
    readMinutes: 5,
    icon: Leaf,
    bullets: [
      'Consistent sleep stabilizes mood and energy across phases.',
      'Protein-forward meals may reduce sugar cravings and crashes.',
      'Gentle movement beats intense bursts when energy is low.',
    ],
  },
  {
    id: 'fertility-myths',
    title: 'Fertility Myths',
    teaser: 'Separate fact from fear about cycles, PCOS, and conception.',
    readMinutes: 4,
    icon: Baby,
    bullets: [
      'Irregular cycles do not mean you cannot conceive.',
      'Ovulation timing varies — tracking helps identify fertile windows.',
      'PCOS management often improves ovulation over time.',
    ],
  },
  {
    id: 'doctor-visits',
    title: 'Doctor Visits',
    teaser: 'How to prepare, what to bring, and advocate for yourself.',
    readMinutes: 5,
    icon: Stethoscope,
    articleSlug: 'doctor-visit-prep',
    bullets: [
      'Bring a symptom timeline with dates and severity.',
      'Ask for plain-language explanations of test results.',
      'It is okay to request a second opinion or specialist referral.',
    ],
  },
];

export function topicById(id: string): KnowledgeTopic | undefined {
  return KNOWLEDGE_TOPICS.find((t) => t.id === id);
}
