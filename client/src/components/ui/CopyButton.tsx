import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/tokens';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function CopyButton({ text, className, label = 'Copy message' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2 py-1 text-micro font-medium',
        'transition-all duration-fast',
        copied
          ? 'text-risk-low'
          : 'text-ink-tertiary hover:bg-surface-tertiary hover:text-ink-secondary active:scale-[0.98]',
        className,
      )}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" aria-hidden="true" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" aria-hidden="true" />
          Copy
        </>
      )}
    </button>
  );
}
