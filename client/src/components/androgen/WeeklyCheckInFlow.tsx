import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Card, Button, ProgressBar } from '@/components/ui';
import { OptionGroup } from './OptionGroup';
import { FaceDiagram } from './FaceDiagram';
import { DarkPatchesEducation } from './DarkPatchesEducation';
import { ScaleInput } from '@/components/tracker/ScaleInput';
import {
  HAIR_SHEDDING_OPTIONS,
  ACNE_OPTIONS,
  BODY_HAIR_OPTIONS,
  DARK_PATCHES_OPTIONS,
  DARK_PATCH_LOCATION_OPTIONS,
} from '@/lib/androgen/constants';
import { defaultCheckIn, serializeCheckIn, weekStartDate } from '@/lib/androgen/checkIn';
import type {
  HairSheddingLevel,
  AcneLevel,
  BodyHairLevel,
  DarkPatchesLevel,
  AcneZone,
  DarkPatchLocation,
  AndrogenWeeklyCheckIn,
} from '@/lib/androgen/types';
import { cn } from '@/lib/tokens';

const STEPS = [
  { id: 'hair', medical: 'Hair changes', simple: 'Hair changes' },
  { id: 'acne', medical: 'Acne', simple: 'Breakouts' },
  { id: 'body_hair', medical: 'Facial or body hair', simple: 'Facial or body hair' },
  { id: 'scalp', medical: 'Scalp oiliness', simple: 'Oily scalp' },
  { id: 'patches', medical: 'Dark skin patches', simple: 'Dark skin patches' },
] as const;

interface WeeklyCheckInFlowProps {
  simpleLanguage: boolean;
  onSubmit: (checkIn: AndrogenWeeklyCheckIn, loggedDate: string) => Promise<void>;
  initial?: Partial<Omit<AndrogenWeeklyCheckIn, 'version'>>;
  saving?: boolean;
}

export function WeeklyCheckInFlow({
  simpleLanguage,
  onSubmit,
  initial,
  saving,
}: WeeklyCheckInFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ ...defaultCheckIn(), ...initial });

  const progress = ((step + 1) / STEPS.length) * 100;
  const stepMeta = STEPS[step];
  const title = simpleLanguage ? stepMeta.simple : stepMeta.medical;

  const canNext = () => {
    if (step === 1 && answers.acne !== 'none' && answers.acne_zones.length === 0) {
      return false;
    }
    if (step === 4 && answers.dark_patches !== 'no' && answers.dark_patch_locations.length === 0) {
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const payload = serializeCheckIn(answers);
    await onSubmit(payload, weekStartDate());
  };

  const setAcne = (acne: AcneLevel) => {
    setAnswers((a) => ({
      ...a,
      acne,
      acne_zones: acne === 'none' ? [] : a.acne_zones,
    }));
  };

  const togglePatchLocation = (location: DarkPatchLocation) => {
    setAnswers((a) => ({
      ...a,
      dark_patch_locations: a.dark_patch_locations.includes(location)
        ? a.dark_patch_locations.filter((l) => l !== location)
        : [...a.dark_patch_locations, location],
    }));
  };

  const setDarkPatches = (dark_patches: DarkPatchesLevel) => {
    setAnswers((a) => ({
      ...a,
      dark_patches,
      dark_patch_locations: dark_patches === 'no' ? [] : a.dark_patch_locations,
    }));
  };
  const toggleZone = (zone: AcneZone) => {
    setAnswers((a) => ({
      ...a,
      acne_zones: a.acne_zones.includes(zone)
        ? a.acne_zones.filter((z) => z !== zone)
        : [...a.acne_zones, zone],
    }));
  };

  return (
    <Card className="overflow-hidden">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-micro text-ink-tertiary">
            Weekly check-in · Step {step + 1} of {STEPS.length}
          </p>
          <span className="text-micro font-medium text-brand-600">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} color="brand" />
      </div>

      <h2 className="font-display text-title text-ink mb-1">{title}</h2>
      <p className="text-caption text-ink-secondary mb-6">
        {step === 0 && (simpleLanguage
          ? 'How has hair falling out or thinning felt this week?'
          : 'How would you describe hair shedding or thinning this week?')}
        {step === 1 && (simpleLanguage
          ? 'Any breakouts this week?'
          : 'How would you rate acne this week?')}
        {step === 2 && (simpleLanguage
          ? 'Any changes in facial or body hair?'
          : 'Notice any changes in facial or body hair?')}
        {step === 3 && (simpleLanguage
          ? 'How oily and dry has your scalp felt this week?'
          : 'Rate scalp oiliness and dryness separately (1 = low, 5 = high)')}
        {step === 4 && (simpleLanguage
          ? 'Have you noticed darker patches? Select where if yes.'
          : 'Have you noticed dark velvety skin patches? Select affected areas.')}
      </p>

      <div className="min-h-[200px] animate-fade-in">
        {step === 0 && (
          <OptionGroup
            name="Hair changes"
            options={HAIR_SHEDDING_OPTIONS}
            value={answers.hair_shedding}
            onChange={(v) => setAnswers((a) => ({ ...a, hair_shedding: v as HairSheddingLevel }))}
            simpleLanguage={simpleLanguage}
          />
        )}

        {step === 1 && (
          <div className="space-y-6">
            <OptionGroup
              name="Acne"
              options={ACNE_OPTIONS}
              value={answers.acne}
              onChange={(v) => setAcne(v as AcneLevel)}
              simpleLanguage={simpleLanguage}
            />
            {answers.acne !== 'none' && (
              <div>
                <p className="section-label mb-3">Where are breakouts showing up?</p>
                <FaceDiagram
                  selected={answers.acne_zones}
                  onToggle={toggleZone}
                  simpleLanguage={simpleLanguage}
                />
                {answers.acne_zones.length === 0 && (
                  <p className="mt-2 text-micro text-risk-moderate">Tap at least one area to continue</p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <OptionGroup
            name="Body hair"
            options={BODY_HAIR_OPTIONS}
            value={answers.body_hair}
            onChange={(v) => setAnswers((a) => ({ ...a, body_hair: v as BodyHairLevel }))}
            simpleLanguage={simpleLanguage}
          />
        )}

        {step === 3 && (
          <div className="space-y-6">
            <ScaleInput
              label={simpleLanguage ? 'Scalp oiliness' : 'Scalp oiliness (1–5)'}
              value={answers.scalp_oiliness}
              onChange={(v) => setAnswers((a) => ({ ...a, scalp_oiliness: v }))}
            />
            <ScaleInput
              label={simpleLanguage ? 'Scalp dryness' : 'Scalp dryness (1–5)'}
              value={answers.scalp_dryness}
              onChange={(v) => setAnswers((a) => ({ ...a, scalp_dryness: v }))}
            />
          </div>
        )}

        {step === 4 && (
          <>
            <OptionGroup
              name="Dark patches"
              options={DARK_PATCHES_OPTIONS}
              value={answers.dark_patches}
              onChange={(v) => setDarkPatches(v as DarkPatchesLevel)}
              simpleLanguage={simpleLanguage}
            />
            {answers.dark_patches !== 'no' && (
              <div className="mt-6">
                <p className="section-label mb-3">Where have you noticed them?</p>
                <div className="flex flex-wrap gap-2">
                  {DARK_PATCH_LOCATION_OPTIONS.map(({ id, label, simpleLabel }) => {
                    const selected = answers.dark_patch_locations.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => togglePatchLocation(id)}
                        aria-pressed={selected}
                        className={cn(
                          'rounded-full px-3.5 py-2 text-micro font-medium ring-1 transition-colors',
                          selected
                            ? 'bg-surface-tertiary text-ink ring-border-strong'
                            : 'bg-surface text-ink-secondary ring-border hover:bg-surface-secondary',
                        )}
                      >
                        {simpleLanguage ? simpleLabel : label}
                      </button>
                    );
                  })}
                </div>
                {answers.dark_patch_locations.length === 0 && (
                  <p className="mt-2 text-micro text-risk-moderate">Select at least one area to continue</p>
                )}
              </div>
            )}
            <DarkPatchesEducation
              simpleLanguage={simpleLanguage}
              show={answers.dark_patches !== 'no'}
            />
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={handleBack} disabled={saving} className="flex-1">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canNext() || saving}
            className={cn('flex-1', step === 0 && 'w-full')}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={saving} disabled={!canNext()} className="flex-1">
            <Check className="h-4 w-4" aria-hidden="true" />
            Save check-in
          </Button>
        )}
      </div>
    </Card>
  );
}
