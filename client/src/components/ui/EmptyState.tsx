import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/tokens';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  /** cycle = muted mauve icon for menstrual empty states */
  context?: 'default' | 'cycle';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  context = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state animate-page-enter', className)}>
      <div className={cn(context === 'cycle' ? 'empty-state-icon-cycle' : 'empty-state-icon')}>
        <Icon
          className={cn('h-6 w-6', context === 'cycle' ? 'text-cycle-500' : 'text-ink-secondary')}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <h3 className="font-display text-title text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-caption text-ink-secondary leading-relaxed">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6"
          size="sm"
          variant={context === 'cycle' ? 'cycle' : 'primary'}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
