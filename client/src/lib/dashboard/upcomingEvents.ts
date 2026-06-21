import type { QuizResult } from '@/types/supabase';
import type { CycleForecast } from './cycleForecast';
import { weekStartDate } from '@/lib/androgen/checkIn';
import { formatForecastDate } from './cycleForecast';

export interface UpcomingHealthEvent {
  id: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  daysUntil: number | null;
  type: 'period' | 'androgen' | 'doctor';
  href: string;
}

function daysUntil(iso: string): number {
  const target = new Date(iso);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((target.getTime() - today.getTime()) / 86_400_000));
}

export function computeUpcomingEvents(input: {
  cycle: CycleForecast;
  lastAndrogenLogDate: string | null;
  latestQuiz: QuizResult | null;
}): UpcomingHealthEvent[] {
  const events: UpcomingHealthEvent[] = [];
  const { cycle, lastAndrogenLogDate, latestQuiz } = input;

  if (cycle.hasData && cycle.nextPeriodDate) {
    const d = daysUntil(cycle.nextPeriodDate);
    events.push({
      id: 'period',
      title: 'Predicted period',
      subtitle: `Cycle day ${cycle.cycleDay ?? '—'} · ${cycle.confidence}% confidence`,
      dateLabel: formatForecastDate(cycle.nextPeriodDate),
      daysUntil: d,
      type: 'period',
      href: '/tracker',
    });
  }

  const weekStart = weekStartDate();
  const androgenDue = !lastAndrogenLogDate || lastAndrogenLogDate < weekStart;
  if (androgenDue) {
    events.push({
      id: 'androgen',
      title: 'Androgen check-in',
      subtitle: 'Weekly hair, skin & scalp log',
      dateLabel: 'This week',
      daysUntil: 0,
      type: 'androgen',
      href: '/androgen',
    });
  } else {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextIso = nextWeek.toISOString().split('T')[0];
    events.push({
      id: 'androgen-next',
      title: 'Next androgen check-in',
      subtitle: 'Stay consistent for better trends',
      dateLabel: formatForecastDate(nextIso),
      daysUntil: daysUntil(nextIso),
      type: 'androgen',
      href: '/androgen',
    });
  }

  const quizDate = latestQuiz?.completed_at ? new Date(latestQuiz.completed_at) : null;
  const daysSinceQuiz = quizDate
    ? Math.floor((Date.now() - quizDate.getTime()) / 86_400_000)
    : null;

  if (daysSinceQuiz == null || daysSinceQuiz > 90) {
    events.push({
      id: 'doctor-prep',
      title: 'Doctor follow-up prep',
      subtitle: daysSinceQuiz == null ? 'Complete your health quiz first' : 'Refresh your health snapshot',
      dateLabel: 'When ready',
      daysUntil: null,
      href: daysSinceQuiz == null ? '/quiz?retake=1' : '/reports',
      type: 'doctor',
    });
  } else if (daysSinceQuiz > 30) {
    const followUp = new Date(quizDate!);
    followUp.setDate(followUp.getDate() + 90);
    events.push({
      id: 'doctor-followup',
      title: 'Upcoming doctor follow-up',
      subtitle: 'Generate an updated report before your visit',
      dateLabel: formatForecastDate(followUp.toISOString().split('T')[0]),
      daysUntil: daysUntil(followUp.toISOString().split('T')[0]),
      type: 'doctor',
      href: '/reports',
    });
  }

  return events.slice(0, 3);
}
