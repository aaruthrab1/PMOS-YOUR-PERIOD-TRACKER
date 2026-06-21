import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/tokens';

interface SakhiAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

const SIZES = {
  sm: 'h-7 w-7 rounded-xl',
  md: 'h-10 w-10 rounded-2xl',
  lg: 'h-16 w-16 rounded-4xl',
};

const ICON = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

export function SakhiAvatar({ size = 'md', className, pulse }: SakhiAvatarProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center bg-brand-500',
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      <Sparkles className={cn(ICON[size], 'text-white')} strokeWidth={1.75} />
      {pulse && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-surface bg-brand-400" />
      )}
    </div>
  );
}
