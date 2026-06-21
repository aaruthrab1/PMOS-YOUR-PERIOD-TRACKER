import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isOnboardingComplete } from '@/lib/auth/onboardingStatus';
import { useOnboardingDemo, DEMO_ONBOARDING_STEPS } from '@/hooks/useOnboardingDemo';
import { usePageTitle } from '@/hooks/usePageTitle';
import { OnboardingLayout, OptionButton } from '@/components/onboarding/OnboardingLayout';
import { AGE_RANGES, HEALTH_GOALS, ONBOARDING_SYMPTOMS } from '@/lib/onboarding/constants';
import { usePersonalization, CYRA_LANGUAGES } from '@/contexts/PersonalizationContext';
import type { CyraLanguageCode } from '@/lib/personalization';
import { cn } from '@/lib/tokens';

function toggleMulti(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function OnboardingDemoPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = usePersonalization();
  const {
    step,
    data,
    error,
    submitting,
    hydrated,
    progress,
    isLast,
    updateData,
    next,
    back,
    finish,
    setLanguage,
  } = useOnboardingDemo();

  usePageTitle(step === 0 ? 'About you' : step === 1 ? 'Your health' : 'Welcome');

  useEffect(() => {
    if (isOnboardingComplete(profile, user)) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, user, navigate]);

  if (!hydrated) return null;

  const handleContinue = async () => {
    if (isLast) {
      const ok = await finish();
      if (ok) navigate('/dashboard', { replace: true });
      return;
    }
    next();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h1 className="font-display text-display-sm text-ink tracking-tight">Tell us about you</h1>
            <p className="mt-2 text-body text-ink-secondary">
              This helps Cyra personalize your dashboard and Sakhi conversations.
            </p>
            <div className="mt-8 space-y-4">
              <Input
                label="Your name"
                value={data.fullName}
                onChange={(e) => updateData({ fullName: e.target.value })}
                placeholder="How should we greet you?"
                autoComplete="name"
                autoFocus
              />
              <div>
                <p className="mb-2 text-caption font-medium text-ink">Age range</p>
                <div className="space-y-2" role="radiogroup" aria-label="Age range">
                  {AGE_RANGES.map((range) => (
                    <OptionButton
                      key={range}
                      selected={data.ageRange === range}
                      onClick={() => updateData({ ageRange: range })}
                    >
                      {range}
                    </OptionButton>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-caption font-medium text-ink">Preferred language</p>
                <div className="grid grid-cols-2 gap-2">
                  {CYRA_LANGUAGES.slice(0, 6).map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        updateData({ preferredLanguage: lang.code as CyraLanguageCode });
                        void setLanguage(lang.code as CyraLanguageCode);
                      }}
                      className={cn(
                        'rounded-2xl px-3 py-2.5 text-left transition-all',
                        data.preferredLanguage === lang.code
                          ? 'bg-brand-500 text-ink-inverse'
                          : 'bg-surface ring-1 ring-border text-ink-secondary',
                      )}
                    >
                      <p className="text-caption font-medium">{lang.nativeLabel}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h1 className="font-display text-display-sm text-ink tracking-tight">What matters to you?</h1>
            <p className="mt-2 text-body text-ink-secondary">
              Select symptoms and goals — you can change these anytime.
            </p>
            <div className="mt-8">
              <p className="section-label mb-3">Health goals</p>
              <div className="space-y-2.5" role="group" aria-label="Health goals">
                {HEALTH_GOALS.map((goal) => (
                  <OptionButton
                    key={goal}
                    multi
                    selected={data.healthGoals.includes(goal)}
                    onClick={() => updateData({ healthGoals: toggleMulti(data.healthGoals, goal) })}
                  >
                    {goal}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <p className="section-label mb-3">Common symptoms (optional)</p>
              <div className="flex flex-wrap gap-2">
                {ONBOARDING_SYMPTOMS.map((symptom) => {
                  const selected = data.commonSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => updateData({ commonSymptoms: toggleMulti(data.commonSymptoms, symptom) })}
                      className={cn(
                        'rounded-full px-4 py-2 text-caption font-medium transition-all',
                        selected ? 'chip-cycle' : 'bg-surface text-ink-secondary ring-1 ring-border',
                      )}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2: {
        const firstName = data.fullName.trim().split(' ')[0] || 'there';
        return (
          <div className="flex flex-col items-center pt-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10">
              <CheckCircle2 className="h-10 w-10 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h1 className="font-display text-display-sm text-ink">You&apos;re all set, {firstName}!</h1>
            <p className="mt-3 max-w-sm text-body text-ink-secondary leading-relaxed">
              Cyra is ready. Track symptoms, explore insights, and chat with Sakhi anytime.
            </p>
            <div className="mt-8 w-full rounded-3xl bg-surface p-5 text-left shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-brand-500" aria-hidden="true" />
                <p className="section-label !mb-0">Try next</p>
              </div>
              <ul className="space-y-2 text-caption text-ink-secondary">
                <li>• Log today&apos;s mood in Track</li>
                <li>• Ask Sakhi a health question</li>
                <li>• Generate a doctor visit summary</li>
              </ul>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      step={step}
      totalSteps={DEMO_ONBOARDING_STEPS}
      progress={progress}
      onBack={back}
      showBack={step > 0 && !isLast}
      footer={
        <>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          <Button fullWidth size="lg" onClick={handleContinue} loading={submitting}>
            {isLast ? t('common.continue') + ' to Cyra' : step === 1 && data.commonSymptoms.length === 0 ? 'Skip symptoms' : t('common.continue')}
            {!isLast && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </>
      }
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
