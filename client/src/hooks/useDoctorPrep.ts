import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrackerData } from './useTrackerData';
import { useAndrogenLogs } from './useAndrogenLogs';
import { useQuizResults } from './useQuizResults';
import { useDiagnosisJourney } from './useDiagnosisJourney';
import { generateDoctorPrep, formatDoctorPrepText } from '@/lib/care/doctorPrep';

export function useDoctorPrep() {
  const { profile } = useAuth();
  const tracker = useTrackerData();
  const androgen = useAndrogenLogs({ limit: 52 });
  const quiz = useQuizResults();
  const diagnosis = useDiagnosisJourney();

  const document = useMemo(
    () =>
      generateDoctorPrep({
        profile,
        cycle: tracker.cycle,
        periodAnalytics: tracker.periodAnalytics,
        sleepAnalytics: tracker.sleepAnalytics,
        moodAnalytics: tracker.moodAnalytics,
        weightAnalytics: tracker.weightAnalytics,
        metabolicAnalytics: tracker.metabolicAnalytics,
        moodLogs: tracker.moodLogs,
        sleepLogs: tracker.sleepLogs,
        weightLogs: tracker.weightLogs,
        metabolicLogs: tracker.metabolicLogs,
        androgenLogs: androgen.data,
        quizResults: quiz.data,
        periods: tracker.periods,
        diagnosisProgress: diagnosis.progress,
      }),
    [
      profile,
      tracker.cycle,
      tracker.periodAnalytics,
      tracker.sleepAnalytics,
      tracker.moodAnalytics,
      tracker.weightAnalytics,
      tracker.metabolicAnalytics,
      tracker.moodLogs,
      tracker.sleepLogs,
      tracker.weightLogs,
      tracker.metabolicLogs,
      tracker.periods,
      androgen.data,
      quiz.data,
      diagnosis.progress,
    ],
  );

  const exportText = useMemo(() => formatDoctorPrepText(document), [document]);

  return {
    document,
    exportText,
    loading: tracker.loading || androgen.loading || quiz.loading,
  };
}
