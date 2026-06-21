import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ChevronRight, Sparkles, Heart, MapPin, Target, Calendar, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { Button, Input, Badge, LoadingScreen, Alert } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isOnboardingComplete } from '@/lib/auth/onboardingStatus';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePageTitle } from '@/hooks/usePageTitle';
import { OnboardingLayout, OptionButton, RegionGrid } from '@/components/onboarding/OnboardingLayout';
import {
  AGE_RANGES,
  HEALTH_GOALS,
  CYCLE_REGULARITY_OPTIONS,
  ONBOARDING_SYMPTOMS,
  ONBOARDING_STEP_TITLES,
} from '@/lib/onboarding/constants';
import type { IndiaRegion } from '@/lib/onboarding/types';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/tokens';

function StepHeader({ title, subtitle, why }: { title: string; subtitle?: string; why?: string }) {
  return (
    <>
      <h1 className="font-display text-display-sm text-ink tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-body text-ink-secondary">{subtitle}</p>}
      {why && (
        <p className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3 text-caption text-ink-secondary leading-relaxed">
          {why}
        </p>
      )}
    </>
  );
}

function toggleMulti(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function OnboardingSetupPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
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
  } = useOnboarding();

  usePageTitle(ONBOARDING_STEP_TITLES[step] || 'Setup');

  useEffect(() => {
    if (isOnboardingComplete(profile, user)) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, user, navigate]);

  if (!hydrated) {
    return <LoadingScreen message="Preparing your setup…" />;
  }

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
          <div className="flex flex-col items-center pt-8 text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl gradient-brand shadow-glow">
              <Heart className="h-10 w-10 text-ink-inverse" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <StepHeader
              title="Welcome to Cyra"
              subtitle="Your calm, private companion for understanding your cycle, symptoms, and wellbeing. Let's personalize your experience in a few quick steps."
            />
            <div className="mt-10 grid w-full gap-3 text-left">
              {[
                { icon: Sparkles, text: 'Track patterns that matter to you' },
                { icon: Target, text: 'Get insights tailored to your goals' },
                { icon: MapPin, text: 'Built for women across India' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl border border-border bg-surface/80 px-4 py-3 shadow-1 backdrop-blur-sm">
                  <Icon className="h-5 w-5 text-brand-500" aria-hidden="true" />
                  <span className="text-caption text-ink-secondary">{text}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <StepHeader title="What should we call you?" subtitle="We'll use this to personalize your experience." />
            <div className="mt-8">
              <Input
                label="Full name"
                value={data.fullName}
                onChange={(e) => updateData({ fullName: e.target.value })}
                placeholder="Your name"
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <StepHeader title="Your age range" subtitle="Helps us tailor health insights. Never shared publicly." />
            <div className="mt-8 space-y-2.5" role="radiogroup" aria-label="Age range">
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
        );

      case 3:
        return (
          <div>
            <StepHeader title="Your region" subtitle="Cyra adapts guidance for your part of India." />
            <div className="mt-8">
              <RegionGrid
                value={data.region}
                onChange={(region) => updateData({ region: region as IndiaRegion })}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <StepHeader
              title="Health goals"
              subtitle="Select all that apply — we'll prioritize these for you."
              why="Your goals shape what Cyra surfaces first — from cycle predictions to doctor prep."
            />
            <div className="mt-8 space-y-2.5" role="group" aria-label="Health goals">
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
        );

      case 5:
        return (
          <div>
            <StepHeader
              title="Last period date"
              subtitle="When did your most recent period start?"
              why="One date unlocks cycle day tracking and smarter predictions — no perfect history needed."
            />
            <div className="mt-8">
              <Input
                label="Period start date"
                type="date"
                value={data.lastPeriodDate}
                onChange={(e) => updateData({ lastPeriodDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                icon={<Calendar className="h-[18px] w-[18px]" aria-hidden="true" />}
              />
              <p className="mt-3 text-micro text-ink-tertiary">
                Used for cycle tracking only. You can update this anytime in the tracker.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <StepHeader
              title="Cycle regularity"
              subtitle="An estimate is perfectly fine."
              why="Regularity helps us calibrate predictions and explain when patterns shift."
            />
            <div className="mt-8 space-y-2.5" role="radiogroup" aria-label="Cycle regularity">
              {CYCLE_REGULARITY_OPTIONS.map((option) => (
                <OptionButton
                  key={option}
                  selected={data.cycleRegularity === option}
                  onClick={() => updateData({ cycleRegularity: option })}
                >
                  {option}
                </OptionButton>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <StepHeader title="Energy levels" subtitle="On a typical day, how is your energy?" />
            <div className="mt-8 rounded-4xl bg-surface p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-caption font-medium text-ink">Typical energy</span>
                <Badge variant="brand">{data.energyLevel ?? '—'}/10</Badge>
              </div>
              <input
                id="energy-onboarding"
                type="range"
                min={1}
                max={10}
                value={data.energyLevel ?? 5}
                onChange={(e) => updateData({ energyLevel: Number(e.target.value) })}
                className="w-full accent-brand-500"
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={data.energyLevel ?? 5}
                aria-labelledby="energy-onboarding"
              />
              <div className="mt-2 flex justify-between text-micro text-ink-muted">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <StepHeader
              title="Common symptoms"
              subtitle="Select any you experience regularly. Optional — skip if none."
              why="Symptoms you share here become the baseline Sakhi uses to spot changes over time."
            />
            <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Common symptoms">
              {ONBOARDING_SYMPTOMS.map((symptom) => {
                const selected = data.commonSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => updateData({ commonSymptoms: toggleMulti(data.commonSymptoms, symptom) })}
                    aria-pressed={selected}
                    className={cn(
                      'rounded-full px-4 py-2.5 text-caption font-medium transition-all',
                      selected
                        ? 'chip-cycle'
                        : 'bg-surface text-ink-secondary ring-1 ring-border hover:bg-surface-secondary'
                    )}
                  >
                    {symptom}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 9: {
        const firstName = data.fullName.trim().split(' ')[0] || 'there';
        return (
          <div className="flex flex-col items-center pt-6 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-tertiary">
              <CheckCircle2 className="h-10 w-10 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <StepHeader
              title={`Welcome, ${firstName}!`}
              subtitle="Cyra is ready. Your dashboard is personalized based on what you shared."
            />
            <div className="mt-8 w-full rounded-4xl bg-surface p-5 text-left shadow-card">
              <p className="section-label mb-3">Your profile</p>
              <dl className="space-y-2.5 text-caption">
                <SummaryRow icon={MapPin} label="Region" value={formatRegion(data.region)} />
                <SummaryRow icon={Target} label="Goals" value={`${data.healthGoals.length} selected`} />
                <SummaryRow icon={Activity} label="Cycle" value={data.cycleRegularity || '—'} />
                <SummaryRow icon={Zap} label="Energy" value={data.energyLevel ? `${data.energyLevel}/10` : '—'} />
              </dl>
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
            {isLast ? 'Enter Cyra' : step === 8 && data.commonSymptoms.length === 0 ? 'Skip for now' : 'Continue'}
            {!isLast && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </>
      }
    >
      {renderStep()}
    </OnboardingLayout>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
      <dt className="text-ink-tertiary">{label}</dt>
      <dd className="ml-auto font-medium text-ink">{value}</dd>
    </div>
  );
}

function formatRegion(region: string): string {
  if (!region) return '—';
  return region.charAt(0).toUpperCase() + region.slice(1);
}
