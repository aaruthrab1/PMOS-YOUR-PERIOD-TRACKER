import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/ui';
import { QuizIllustration } from '@/components/quiz/QuizIllustration';
import {
  QuizConversationLayout,
  SakhiBubble,
} from '@/components/quiz/QuizConversationLayout';
import { QuizQuestionScreen } from '@/components/quiz/QuizQuestionScreen';
import { HealthSnapshotResult } from '@/components/quiz/HealthSnapshotResult';
import { useHealthQuiz } from '@/hooks/useHealthQuiz';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/contexts/AuthContext';
import { submitHealthQuiz } from '@/lib/quiz/submit';
import type { QuizHealthSnapshot } from '@/lib/quiz/types';

export function QuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRetake = searchParams.get('retake') === '1';
  const { profile, refreshProfile } = useAuth();

  const quiz = useHealthQuiz();
  const [snapshot, setSnapshot] = useState<QuizHealthSnapshot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStarted, setSubmitStarted] = useState(false);

  usePageTitle(quiz.showResults ? 'Your health snapshot' : 'Health quiz');

  useEffect(() => {
    if (quiz.question?.id === 'energy' && quiz.selected.length === 0) {
      quiz.setSliderValue(5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init energy default once per step
  }, [quiz.question?.id]);

  useEffect(() => {
    if (!quiz.showResults || snapshot || submitStarted) return;

    setSubmitStarted(true);
    setSubmitting(true);
    quiz.setError('');

    void (async () => {
      try {
        const markOnboarding = !profile?.onboarding_completed && !isRetake;
        const result = await submitHealthQuiz(quiz.answers, { markOnboardingComplete: markOnboarding });
        setSnapshot(result.snapshot);
        await refreshProfile();
      } catch (err) {
        quiz.setError(err instanceof Error ? err.message : 'Could not save your answers.');
        setSubmitStarted(false);
        quiz.back();
      } finally {
        setSubmitting(false);
      }
    })();
  }, [quiz.showResults, snapshot, submitStarted, isRetake, profile?.onboarding_completed, refreshProfile, quiz.answers]);

  if (!quiz.hydrated) {
    return <LoadingScreen message="Preparing your quiz…" />;
  }

  const handleContinue = () => {
    if (quiz.isLastQuestion) {
      quiz.next();
      return;
    }
    quiz.next();
  };

  const handleFinish = () => {
    const target = snapshot?.nextActions.find((a) => a.primary)?.href ?? '/dashboard';
    navigate(target, { replace: true });
  };

  if (quiz.showResults) {
    if (!snapshot || submitting) {
      return <LoadingScreen message="Building your health snapshot…" />;
    }

    return (
      <QuizConversationLayout
        stepLabel="Complete"
        progress={100}
        showBack={false}
        footer={<div />}
      >
        <HealthSnapshotResult snapshot={snapshot} onFinish={handleFinish} />
      </QuizConversationLayout>
    );
  }

  const skipLabel =
    quiz.question?.optional && quiz.selected.length === 0 ? 'Skip for now' : 'Continue';

  return (
    <QuizConversationLayout
      stepLabel={quiz.progressLabel}
      progress={quiz.progressPercent}
      onBack={quiz.back}
      showBack={quiz.step > 0}
      footer={
        <>
          {quiz.error && (
            <div className="mb-4 rounded-2xl border border-risk-high-border bg-risk-high-bg px-4 py-3 text-caption text-risk-high" role="alert">
              {quiz.error}
            </div>
          )}
          <Button
            fullWidth
            size="lg"
            onClick={handleContinue}
            disabled={!quiz.canContinue && !quiz.question?.optional}
          >
            {quiz.isWelcome ? "Let's begin" : quiz.isLastQuestion ? 'See my health snapshot' : skipLabel}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </>
      }
    >
      {quiz.question && (
        <>
          <SakhiBubble message={quiz.question.encouragement} />
          {quiz.question.id === 'welcome' ? (
            <div>
              <QuizIllustration id="welcome" className="mb-6" />
              <h1 className="font-display text-display-sm text-ink">{quiz.question.title}</h1>
              <p className="mt-2 text-body text-ink-secondary">{quiz.question.subtitle}</p>
              <p className="mt-6 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-caption text-ink-secondary leading-relaxed">
                {quiz.question.whyWeAsk}
              </p>
            </div>
          ) : (
            <QuizQuestionScreen
              question={quiz.question}
              selected={quiz.selected}
              onToggle={quiz.toggleOption}
              onSliderChange={quiz.setSliderValue}
            />
          )}
        </>
      )}
    </QuizConversationLayout>
  );
}
