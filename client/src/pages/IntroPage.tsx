import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Heart, Sparkles, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/tokens';
import { markIntroSeen } from '@/lib/onboarding/storage';
import { AuthLanguageBar } from '@/components/auth/AuthLanguageBar';
import { usePageTitle } from '@/hooks/usePageTitle';

const slides = [
  {
    icon: Heart,
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-500',
    title: 'Understand your body',
    description: 'Track symptoms, moods, and cycle patterns with a companion designed for how you actually feel.',
    why: 'We start here because your daily experience matters more than any single test result.',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-risk-low-bg',
    iconColor: 'text-risk-low',
    title: 'Discover your patterns',
    description: 'Visual insights reveal connections between hormones, symptoms, and daily life — so nothing feels random.',
    why: 'Patterns help you and your doctor see the full picture, not just today\'s symptoms.',
  },
  {
    icon: Sparkles,
    iconBg: 'bg-cycle-50',
    iconColor: 'text-cycle-500',
    title: 'AI-powered guidance',
    description: 'Get compassionate, evidence-based support and walk into every doctor visit fully prepared.',
    why: 'Sakhi learns from your logs so advice feels personal — never generic.',
  },
  {
    icon: Shield,
    iconBg: 'bg-surface-tertiary',
    iconColor: 'text-brand-600',
    title: 'Private & secure',
    description: 'Your health data is encrypted, never sold, and always under your control.',
    why: 'Trust is the foundation of any healthcare product. We take that seriously.',
  },
];

/** Pre-auth marketing intro — shown before signup/login */
export function IntroPage() {
  usePageTitle('Welcome');
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const Icon = slide.icon;
  const isLast = current === slides.length - 1;

  const goToSignup = () => {
    markIntroSeen();
    navigate('/signup');
  };

  return (
    <div className="flex min-h-screen flex-col gradient-hero">
      <div className="px-page-x pt-4">
        <AuthLanguageBar />
      </div>
      <div className="flex items-center justify-between px-page-x pt-2">
        <p className="text-caption font-medium text-ink-muted">
          Step {current + 1} of {slides.length}
        </p>
        <button
          type="button"
          onClick={goToSignup}
          className="text-caption font-medium text-ink-secondary transition-colors hover:text-ink"
        >
          Skip
        </button>
      </div>

      <div className="px-page-x pt-2">
        <div className="h-1 overflow-hidden rounded-full bg-surface-tertiary">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-smooth"
            style={{ width: `${((current + 1) / slides.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={current + 1}
            aria-valuemin={1}
            aria-valuemax={slides.length}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-page-x">
        <div key={current} className="w-full max-w-sm animate-scale-in text-center">
          <div className={cn('mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl shadow-2', slide.iconBg)}>
            <Icon className={cn('h-9 w-9', slide.iconColor)} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-display-sm text-ink tracking-tight">{slide.title}</h1>
          <p className="mt-4 text-body leading-relaxed text-ink-secondary">{slide.description}</p>
          <p className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3 text-caption text-ink-secondary leading-relaxed">
            {slide.why}
          </p>
        </div>
      </div>

      <div className="px-page-x pb-10">
        <div className="mb-8 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === current ? 'w-8 bg-brand-500' : 'w-2 bg-surface-tertiary',
              )}
            />
          ))}
        </div>

        {isLast ? (
          <div className="space-y-3">
            <Button fullWidth size="lg" onClick={goToSignup}>
              Create your account
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-center text-caption text-ink-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
            </p>
          </div>
        ) : (
          <Button fullWidth size="lg" onClick={() => setCurrent(current + 1)}>
            Continue
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

/** @deprecated Use IntroPage */
export const OnboardingPage = IntroPage;
