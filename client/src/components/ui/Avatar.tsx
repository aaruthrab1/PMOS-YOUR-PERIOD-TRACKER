import { cn } from '@/lib/tokens';

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const sizes = {
    sm: 'h-8 w-8 text-micro',
    md: 'h-10 w-10 text-caption',
    lg: 'h-14 w-14 text-title',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn('rounded-full object-cover ring-1 ring-border', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-brand-500 font-semibold text-white',
        sizes[size],
        className
      )}
      aria-hidden={!name}
    >
      {initials}
    </div>
  );
}
