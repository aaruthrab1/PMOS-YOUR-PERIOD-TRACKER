import { Badge } from '@/components/ui';
import { QuizIllustration } from './QuizIllustration';
import { WhyWeAsk } from './QuizConversationLayout';
import type { QuizQuestion } from '@/lib/quiz/types';
import { cn } from '@/lib/tokens';

interface QuizQuestionScreenProps {
  question: QuizQuestion;
  selected: string[];
  onToggle: (value: string) => void;
  onSliderChange?: (value: number) => void;
}

export function QuizQuestionScreen({
  question,
  selected,
  onToggle,
  onSliderChange,
}: QuizQuestionScreenProps) {
  const sliderValue = question.slider
    ? Number(selected[0] ?? Math.ceil((question.slider.min + question.slider.max) / 2))
    : null;

  return (
    <div className="pb-4">
      <QuizIllustration id={question.illustration} className="mb-6" />

      <h1 className="font-display text-display-sm text-ink">{question.title}</h1>
      <p className="mt-2 text-body text-ink-secondary">{question.subtitle}</p>

      <WhyWeAsk text={question.whyWeAsk} />

      {question.slider && onSliderChange ? (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-caption font-medium text-ink">Your typical energy</span>
            <Badge variant="brand">{sliderValue}/10</Badge>
          </div>
          <input
            type="range"
            min={question.slider.min}
            max={question.slider.max}
            value={sliderValue ?? 5}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            className="w-full accent-brand-500"
            aria-valuemin={question.slider.min}
            aria-valuemax={question.slider.max}
            aria-valuenow={sliderValue ?? 5}
            aria-label="Typical energy level"
          />
          <div className="mt-2 flex justify-between text-micro text-ink-muted">
            <span>{question.slider.labels[0]}</span>
            <span>{question.slider.labels[1]}</span>
          </div>
        </div>
      ) : (
        question.options &&
        question.options.length > 0 && (
          <div
            className="space-y-2.5"
            role={question.multi ? 'group' : 'radiogroup'}
            aria-label={question.title}
          >
            {question.options.map((opt) => {
              const active = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onToggle(opt.value)}
                  role={question.multi ? 'checkbox' : 'radio'}
                  aria-checked={active}
                  className={cn(
                    'flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-caption font-medium transition-all',
                    active
                      ? 'border-brand-500 bg-surface-tertiary text-ink'
                      : 'border-border bg-surface text-ink-secondary hover:border-border-strong',
                  )}
                >
                  {opt.label}
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      active ? 'border-brand-500 bg-brand-500' : 'border-ink-muted',
                      question.multi && 'rounded-md',
                    )}
                    aria-hidden="true"
                  >
                    {active && !question.multi && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                    {active && question.multi && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )
      )}

      {question.optional && (
        <p className="mt-4 text-center text-micro text-ink-muted">
          Optional — you can skip this question
        </p>
      )}
    </div>
  );
}
