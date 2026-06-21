import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/tokens';
import { getPostAuthRoute } from '@/lib/navigation';

export function SplashPage() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [phase, setPhase] = useState(1);
  const [minBrandShown, setMinBrandShown] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setMinBrandShown(true), 600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (loading || !minBrandShown) return;

    if (user) {
      navigate(getPostAuthRoute(profile, user), { replace: true });
      return;
    }

    navigate('/login', { replace: true });
  }, [loading, user, profile, minBrandShown, navigate]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gradient-hero"
      role="status"
      aria-label="Loading Cyra"
    >
      <div className={cn(
        'transition-all duration-700 ease-smooth',
        phase >= 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      )}>
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-brand shadow-glow">
            <span className="font-display text-3xl font-semibold text-white">C</span>
          </div>
      </div>

      <div className={cn(
        'mt-8 text-center transition-all duration-700 delay-200',
        phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}>
        <h1 className="font-display text-display-sm text-ink">Cyra</h1>
        <p className="mt-2 text-body text-ink-secondary">Your health companion</p>
      </div>
    </div>
  );
}
