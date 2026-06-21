import type { QuizIllustrationId } from '@/lib/quiz/types';
import { cn } from '@/lib/tokens';

interface QuizIllustrationProps {
  id: QuizIllustrationId;
  className?: string;
}

/** Minimal clinical illustrations — flat shapes, no decorative gradients */
export function QuizIllustration({ id, className }: QuizIllustrationProps) {
  return (
    <div
      className={cn(
        'mx-auto flex h-36 w-36 items-center justify-center rounded-3xl bg-surface-tertiary',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" className="h-24 w-24" fill="none">
        {ILLUSTRATIONS[id]}
      </svg>
    </div>
  );
}

const stroke = 'var(--color-brand-500)';
const muted = 'var(--color-ink-muted)';
const cycle = 'var(--color-cycle-500)';

const ILLUSTRATIONS: Record<QuizIllustrationId, JSX.Element> = {
  welcome: (
    <>
      <circle cx="60" cy="42" r="18" stroke={stroke} strokeWidth="2.5" />
      <path d="M36 88c4-14 16-22 24-22s20 8 24 22" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 38c2 2 6 2 8 0M64 38c2 2 6 2 8 0" stroke={muted} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  goals: (
    <>
      <circle cx="60" cy="60" r="28" stroke={stroke} strokeWidth="2" />
      <circle cx="60" cy="60" r="8" fill={stroke} />
      <path d="M60 32v8M60 80v8M32 60h8M80 60h8" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  conditions: (
    <>
      <rect x="34" y="30" width="52" height="60" rx="8" stroke={stroke} strokeWidth="2" />
      <path d="M46 48h28M46 58h20M46 68h24" stroke={muted} strokeWidth="2" strokeLinecap="round" />
      <path d="M78 42l8 8-14 14-8-8z" stroke={cycle} strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  cycle: (
    <>
      <circle cx="60" cy="60" r="30" stroke={muted} strokeWidth="2" strokeDasharray="4 4" />
      <path d="M60 30v6M60 84v6M30 60h6M84 60h6" stroke={muted} strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="30" r="6" fill={cycle} />
      <path d="M60 36a24 24 0 0 1 20.8 12" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  energy: (
    <>
      <path d="M60 24l-12 28h20l-8 28 24-36H64z" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" fill="none" />
      <path d="M28 92h64" stroke={muted} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  symptoms: (
    <>
      <path d="M40 78V48c0-8 6-14 20-14s20 6 20 14v30" stroke={stroke} strokeWidth="2" />
      <circle cx="48" cy="52" r="3" fill={cycle} />
      <circle cx="72" cy="52" r="3" fill={cycle} />
      <path d="M52 64c4 4 12 4 16 0" stroke={muted} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  tracking: (
    <>
      <rect x="38" y="28" width="44" height="64" rx="6" stroke={stroke} strokeWidth="2" />
      <path d="M48 44h24M48 54h18M48 64h20" stroke={muted} strokeWidth="2" strokeLinecap="round" />
      <circle cx="78" cy="78" r="14" fill="var(--color-surface)" stroke={stroke} strokeWidth="2" />
      <path d="M73 78l4 4 8-8" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  snapshot: (
    <>
      <rect x="32" y="34" width="56" height="52" rx="8" stroke={stroke} strokeWidth="2" />
      <path d="M44 72l10-12 8 8 14-18" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="82" cy="38" r="10" stroke={cycle} strokeWidth="2" />
      <path d="M78 38h8M82 34v8" stroke={cycle} strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};
