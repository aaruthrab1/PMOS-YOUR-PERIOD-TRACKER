export interface CyclePhaseSegment {
  id: string;
  label: string;
  simpleLabel: string;
  startDay: number;
  endDay: number;
  color: string;
  description: {
    medical: string;
    simple: string;
  };
}

export interface CyclePattern {
  id: string;
  label: string;
  length: number;
  lengthLabel: string;
  segments: CyclePhaseSegment[];
}

function buildSegments(totalDays: number, pattern: 'typical' | 'pmos'): CyclePhaseSegment[] {
  const periodEnd = pattern === 'typical' ? 5 : 6;
  const ovulationDay = pattern === 'typical' ? 14 : Math.round(totalDays * 0.45);
  const follicularEnd = ovulationDay - 2;

  return [
    {
      id: 'period',
      label: 'Period',
      simpleLabel: 'Period',
      startDay: 1,
      endDay: periodEnd,
      color: '#EC4899',
      description: {
        medical: 'Menstrual bleeding as the uterine lining sheds. Hormone levels are typically at their lowest.',
        simple: 'Bleeding days when the uterine lining sheds. Energy may feel lower for some people.',
      },
    },
    {
      id: 'follicular',
      label: 'Follicular Phase',
      simpleLabel: 'After period',
      startDay: periodEnd + 1,
      endDay: follicularEnd,
      color: '#5B4BDB',
      description: {
        medical: 'Follicles develop in the ovaries; estrogen rises. Energy and mood often improve for many people.',
        simple: 'Your body prepares an egg. Many people feel more energy and clearer mood in this stretch.',
      },
    },
    {
      id: 'ovulation',
      label: 'Ovulation',
      simpleLabel: 'Mid-cycle',
      startDay: follicularEnd + 1,
      endDay: ovulationDay + 1,
      color: '#8B5CF6',
      description: {
        medical: 'LH surge triggers egg release. Fertile window is typically a few days around this time.',
        simple: 'The egg is released. Some notice brief changes in mood, energy, or mild one-sided discomfort.',
      },
    },
    {
      id: 'luteal',
      label: 'Luteal Phase',
      simpleLabel: 'Before next period',
      startDay: ovulationDay + 2,
      endDay: totalDays,
      color: '#F59E0B',
      description: {
        medical: 'Progesterone rises after ovulation. PMOS symptoms often intensify in this phase for some people.',
        simple: 'The body prepares for either pregnancy or the next period. Mood, sleep, and skin changes are common here.',
      },
    },
  ];
}

export const TYPICAL_CYCLE: CyclePattern = {
  id: 'typical',
  label: 'Typical Cycle',
  length: 28,
  lengthLabel: '28 days',
  segments: buildSegments(28, 'typical'),
};

export const PMOS_CYCLE: CyclePattern = {
  id: 'pmos',
  label: 'PMOS Pattern',
  length: 42,
  lengthLabel: '38–45 days',
  segments: buildSegments(42, 'pmos'),
};

export const CYCLE_PATTERNS = [TYPICAL_CYCLE, PMOS_CYCLE];
