import type { QuizResult } from '@/types/supabase';
import type { InsightSummary } from '@/types/database';
import type { JourneyProgress } from './types';
import { JOURNEY_STEPS, findCurrentStepId } from './diagnosisJourney';

export interface RecommendedNextStep {
  title: string;
  description: string;
  sources: { label: string; detail: string }[];
  cta: { label: string; href: string };
}

interface RecommendInput {
  quizResults: QuizResult[];
  symptomSummary: InsightSummary | null;
  journeyProgress: JourneyProgress;
  hasPeriodLogs: boolean;
  hasRecentMoodLogs: boolean;
}

export function computeRecommendedNextStep(input: RecommendInput): RecommendedNextStep {
  const { quizResults, symptomSummary, journeyProgress, hasPeriodLogs, hasRecentMoodLogs } = input;
  const currentStepId = findCurrentStepId(journeyProgress.steps);
  const currentStep = JOURNEY_STEPS.find((s) => s.id === currentStepId)!;
  const latestQuiz = quizResults[0];
  const daysSinceQuiz = latestQuiz?.completed_at
    ? Math.floor((Date.now() - new Date(latestQuiz.completed_at).getTime()) / 86_400_000)
    : null;

  const sources: { label: string; detail: string }[] = [];

  if (latestQuiz) {
    sources.push({
      label: 'Quiz',
      detail: daysSinceQuiz != null && daysSinceQuiz <= 30
        ? `Health snapshot ${daysSinceQuiz}d ago`
        : 'Retake recommended — snapshot is stale',
    });
  } else {
    sources.push({ label: 'Quiz', detail: 'Not completed yet' });
  }

  if (symptomSummary?.topSymptoms?.length) {
    sources.push({
      label: 'Symptoms',
      detail: symptomSummary.topSymptoms.slice(0, 2).map((s) => s.name).join(', '),
    });
  } else if (symptomSummary?.daysLogged) {
    sources.push({ label: 'Symptoms', detail: `${symptomSummary.daysLogged} days logged` });
  } else {
    sources.push({ label: 'Symptoms', detail: 'Start logging in Tracker' });
  }

  const completedSteps = JOURNEY_STEPS.filter((s) => journeyProgress.steps[s.id]?.completed).length;
  sources.push({
    label: 'History',
    detail: completedSteps > 0
      ? `Journey step ${completedSteps + 1} of ${JOURNEY_STEPS.length}`
      : `At "${currentStep.title}"`,
  });

  if (!latestQuiz) {
    return {
      title: 'Complete your health quiz',
      description: 'A guided snapshot helps Cyra recommend the right care path and doctor prep content.',
      sources,
      cta: { label: 'Take health quiz', href: '/quiz' },
    };
  }

  if (!hasPeriodLogs && !hasRecentMoodLogs) {
    return {
      title: 'Log symptoms for 7 days',
      description: 'Daily mood, sleep, and cycle logs unlock personalized doctor prep and pattern insights.',
      sources,
      cta: { label: 'Open tracker', href: '/tracker' },
    };
  }

  if (currentStepId === 'symptoms_noticed') {
    return {
      title: 'Prepare for your first doctor visit',
      description: 'Generate a symptom summary and questions from your quiz results and tracker history.',
      sources,
      cta: { label: 'Open doctor prep', href: '#doctor-prep' },
    };
  }

  if (currentStepId === 'doctor_visited') {
    return {
      title: 'Review recommended blood tests',
      description: 'Based on your symptoms and quiz, see which labs are commonly ordered and why.',
      sources,
      cta: { label: 'View test guide', href: '#doctor-prep' },
    };
  }

  if (currentStepId === 'blood_tests') {
    return {
      title: 'Prepare for your ultrasound',
      description: 'Know what to expect, what to ask, and how to track results in your journey.',
      sources,
      cta: { label: 'Continue journey', href: '#diagnosis-journey' },
    };
  }

  if (daysSinceQuiz != null && daysSinceQuiz > 60) {
    return {
      title: 'Refresh your health snapshot',
      description: 'Your quiz is over 60 days old — retake to update recommendations and doctor prep.',
      sources,
      cta: { label: 'Retake quiz', href: '/quiz?retake=1' },
    };
  }

  const topSymptom = symptomSummary?.topSymptoms?.[0]?.name;
  if (topSymptom) {
    return {
      title: `Explore care for ${topSymptom.toLowerCase()}`,
      description: `Your logs highlight ${topSymptom} — read targeted guides or find a specialist nearby.`,
      sources,
      cta: { label: 'Browse library', href: '#knowledge-library' },
    };
  }

  return {
    title: `Continue: ${currentStep.title}`,
    description: currentStep.guidance,
    sources,
    cta: { label: 'Open journey step', href: '#diagnosis-journey' },
  };
}

export function scrollToCareSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
