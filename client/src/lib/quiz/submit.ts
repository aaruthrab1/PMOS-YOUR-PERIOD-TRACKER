import { saveQuizResult } from '@/lib/db/quizResults';
import { updateProfile, updatePreferences } from '@/lib/db/profiles';
import { computeQuizHealthSnapshot, quizAnswersToProfilePatch } from './computeSnapshot';
import type { QuizAnswers, QuizHealthSnapshot } from './types';
import type { Json } from '@/types/supabase';

const QUIZ_STORAGE_KEY = 'cyra_health_quiz_progress';

export function clearQuizProgress(): void {
  try {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export async function submitHealthQuiz(
  answers: QuizAnswers,
  options?: { markOnboardingComplete?: boolean },
): Promise<{ snapshot: QuizHealthSnapshot }> {
  const snapshot = computeQuizHealthSnapshot(answers);
  const { profile, preferences } = quizAnswersToProfilePatch(answers);

  await updateProfile({
    ...profile,
    ...(options?.markOnboardingComplete ? { onboarding_completed: true } : {}),
  });

  if (preferences.cycle_length_avg != null) {
    await updatePreferences({ cycle_length_avg: preferences.cycle_length_avg }).catch(() => {});
  }

  const recommendations = [
    snapshot.headline,
    ...snapshot.focusAreas.map((f) => f.label),
  ];

  await saveQuizResult({
    quiz_type: 'health_snapshot_v1',
    answers: answers as Json,
    recommendations,
    score: snapshot.score,
  });

  clearQuizProgress();
  return { snapshot };
}
