import { useCallback, useEffect, useMemo, useState } from 'react';
import { QUIZ_QUESTIONS, QUIZ_PROGRESS_STEPS, QUIZ_STORAGE_KEY } from '@/lib/quiz/questions';
import type { QuizAnswers, QuizProgress } from '@/lib/quiz/types';

function loadProgress(): QuizProgress | null {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuizProgress;
  } catch {
    return null;
  }
}

function saveProgress(step: number, answers: QuizAnswers) {
  try {
    const payload: QuizProgress = { step, answers, updatedAt: Date.now() };
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function useHealthQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const cached = loadProgress();
    if (cached) {
      setStep(cached.step);
      setAnswers(cached.answers);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(step, answers);
  }, [step, answers, hydrated]);

  const question = QUIZ_QUESTIONS[step];
  const isWelcome = question?.id === 'welcome';
  const isLastQuestion = step === QUIZ_QUESTIONS.length - 1;
  const showResults = step >= QUIZ_QUESTIONS.length;

  const progressIndex = Math.max(0, step - (isWelcome ? 0 : 0));
  const progressPercent = showResults
    ? 100
    : Math.round(((progressIndex + 1) / QUIZ_PROGRESS_STEPS.length) * 100);

  const selected = useMemo(
    () => (question ? answers[question.id] ?? [] : []),
    [answers, question],
  );

  const canContinue = useMemo(() => {
    if (!question || showResults) return true;
    if (question.id === 'welcome') return true;
    if (question.optional) return true;
    if (question.slider) return selected.length === 1;
    return selected.length > 0;
  }, [question, selected, showResults]);

  const toggleOption = useCallback(
    (value: string) => {
      if (!question) return;
      setAnswers((prev) => {
        const current = prev[question.id] ?? [];
        if (question.multi) {
          const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return { ...prev, [question.id]: next };
        }
        return { ...prev, [question.id]: [value] };
      });
      setError('');
    },
    [question],
  );

  const setSliderValue = useCallback(
    (value: number) => {
      if (!question) return;
      setAnswers((prev) => ({ ...prev, [question.id]: [String(value)] }));
      setError('');
    },
    [question],
  );

  const next = useCallback(() => {
    if (!canContinue) {
      setError('Choose an option to continue — or skip if this question is optional.');
      return false;
    }
    setError('');
    setStep((s) => Math.min(s + 1, QUIZ_QUESTIONS.length));
    return true;
  }, [canContinue]);

  const back = useCallback(() => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  return {
    step,
    question,
    answers,
    selected,
    error,
    submitting,
    setSubmitting,
    setError,
    hydrated,
    progressPercent,
    progressLabel: showResults
      ? 'Complete'
      : `${Math.min(step + 1, QUIZ_PROGRESS_STEPS.length)} of ${QUIZ_PROGRESS_STEPS.length}`,
    isWelcome,
    isLastQuestion,
    showResults,
    canContinue,
    toggleOption,
    setSliderValue,
    next,
    back,
    totalSteps: QUIZ_QUESTIONS.length,
  };
}
