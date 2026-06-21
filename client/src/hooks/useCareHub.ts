import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSymptoms } from '@/contexts/SymptomContext';
import { useQuizResults } from '@/hooks/useQuizResults';
import { useDiagnosisJourney } from '@/hooks/useDiagnosisJourney';
import { usePeriodLogs } from '@/hooks/usePeriodLogs';
import { useMoodLogs } from '@/hooks/useMoodLogs';
import { computeRecommendedNextStep } from '@/lib/care/recommendedNextStep';

export function useCareHub() {
  const { profile } = useAuth();
  const { summary } = useSymptoms();
  const quiz = useQuizResults();
  const journey = useDiagnosisJourney();
  const periods = usePeriodLogs({ limit: 12 });
  const mood = useMoodLogs({ limit: 14 });

  const hasRecentMoodLogs = mood.data.some((m) => !m.deleted_at);
  const hasPeriodLogs = periods.data.some((p) => !p.deleted_at);

  const recommendedStep = useMemo(
    () =>
      computeRecommendedNextStep({
        quizResults: quiz.data,
        symptomSummary: summary,
        journeyProgress: journey.progress,
        hasPeriodLogs,
        hasRecentMoodLogs,
      }),
    [quiz.data, summary, journey.progress, hasPeriodLogs, hasRecentMoodLogs],
  );

  return {
    profile,
    recommendedStep,
    journey,
    loading: quiz.loading || periods.loading,
  };
}
