import { ChevronLeft } from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { cn } from '@/lib/tokens';

interface QuizConversationLayoutProps {
  stepLabel: string;
  progress: number;
  onBack?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function QuizConversationLayout({
  stepLabel,
  progress,
  onBack,
  showBack = true,
  children,
  footer,
}: QuizConversationLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary">
      <div className="px-page-x pt-6">
        <div className="mb-2 flex items-center justify-between">
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-surface-tertiary"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <span className="text-caption font-medium text-ink-secondary">{stepLabel}</span>
          <div className="w-10" />
        </div>
        <ProgressBar value={progress} color="brand" className="mb-2" label="Progress" showValue />
      </div>

      <div className="flex flex-1 flex-col px-page-x">
        <div key={stepLabel} className="animate-slide-up flex-1">
          {children}
        </div>
      </div>

      <div className="px-page-x pb-10 pt-4">{footer}</div>
    </div>
  );
}

interface SakhiBubbleProps {
  message: string;
  className?: string;
}

export function SakhiBubble({ message, className }: SakhiBubbleProps) {
  return (
    <div className={cn('mb-6 flex gap-3', className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-micro font-bold text-ink-inverse">
        S
      </div>
      <p className="rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 text-caption text-ink-secondary leading-relaxed">
        {message}
      </p>
    </div>
  );
}

interface WhyWeAskProps {
  text: string;
}

export function WhyWeAsk({ text }: WhyWeAskProps) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-surface-secondary px-4 py-3">
      <p className="text-overline uppercase text-brand-500 mb-1">Why we ask</p>
      <p className="text-micro text-ink-secondary leading-relaxed">{text}</p>
    </div>
  );
}
