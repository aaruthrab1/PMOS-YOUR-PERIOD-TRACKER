import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  createEmptyProgress,
  JOURNEY_STEPS,
  migrateLegacyProgress,
  findCurrentStepId,
  journeyEncouragement,
} from '@/lib/care/diagnosisJourney';
import type { JourneyProgress, JourneyStepId, JourneyStepState } from '@/lib/care/types';
import { listJourneySteps, rowsToProgress, upsertJourneyStep } from '@/lib/db/journeySteps';

function storageKey(userId: string) {
  return `cyra_health_journey_${userId}`;
}

function loadLegacyProgress(userId: string): JourneyProgress | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JourneyProgress;
    const steps = migrateLegacyProgress(parsed.steps as Record<string, JourneyStepState>);
    for (const step of JOURNEY_STEPS) {
      const saved = parsed.steps?.[step.id];
      if (saved) steps[step.id] = { ...steps[step.id], ...saved };
    }
    return { steps, updatedAt: parsed.updatedAt ?? Date.now() };
  } catch {
    return null;
  }
}

function mergeProgress(rows: ReturnType<typeof rowsToProgress>): JourneyProgress {
  const steps = createEmptyProgress();
  for (const step of JOURNEY_STEPS) {
    const saved = rows[step.id];
    if (saved) steps[step.id] = { ...steps[step.id], ...saved };
  }
  return { steps, updatedAt: Date.now() };
}

export function useDiagnosisJourney() {
  const { user } = useAuth();
  const userId = user?.id;
  const [progress, setProgress] = useState<JourneyProgress>(() => ({
    steps: createEmptyProgress(),
    updatedAt: Date.now(),
  }));
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setProgress({ steps: createEmptyProgress(), updatedAt: Date.now() });
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const rows = await listJourneySteps(userId);
        if (cancelled) return;

        if (rows.length === 0) {
          const legacy = loadLegacyProgress(userId);
          if (legacy) {
            setProgress(legacy);
            await Promise.all(
              JOURNEY_STEPS.map((step) => {
                const s = legacy.steps[step.id];
                if (!s.completed && !s.notes) return Promise.resolve();
                return upsertJourneyStep(step.id, {
                  completed: s.completed,
                  completedDate: s.completedDate,
                  notes: s.notes,
                });
              }),
            );
            localStorage.removeItem(storageKey(userId));
            return;
          }
        }

        setProgress(mergeProgress(rowsToProgress(rows)));
      } catch {
        const legacy = loadLegacyProgress(userId);
        if (!cancelled) setProgress(legacy ?? { steps: createEmptyProgress(), updatedAt: Date.now() });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  const completedCount = useMemo(
    () => JOURNEY_STEPS.filter((s) => progress.steps[s.id]?.completed).length,
    [progress],
  );

  const progressPercent = Math.round((completedCount / JOURNEY_STEPS.length) * 100);
  const currentStepId = useMemo(() => findCurrentStepId(progress.steps), [progress.steps]);
  const encouragement = useMemo(() => journeyEncouragement(completedCount), [completedCount]);

  const updateStep = useCallback(
    (stepId: JourneyStepId, updates: Partial<JourneyStepState>) => {
      setProgress((prev) => {
        const next: JourneyProgress = {
          steps: {
            ...prev.steps,
            [stepId]: { ...prev.steps[stepId], ...updates },
          },
          updatedAt: Date.now(),
        };
        return next;
      });

      if (userId) {
        void upsertJourneyStep(stepId, {
          completed: updates.completed,
          completedDate: updates.completedDate,
          notes: updates.notes,
        }).catch(() => {});
      }
    },
    [userId],
  );

  const toggleComplete = useCallback(
    (stepId: JourneyStepId) => {
      const current = progress.steps[stepId];
      const completed = !current.completed;
      updateStep(stepId, {
        completed,
        completedDate: completed ? new Date().toISOString().split('T')[0] : null,
      });
    },
    [progress.steps, updateStep],
  );

  return {
    progress,
    completedCount,
    progressPercent,
    currentStepId,
    encouragement,
    updateStep,
    toggleComplete,
    steps: JOURNEY_STEPS,
    loading,
  };
}

/** @deprecated Alias for useDiagnosisJourney */
export const useHealthJourney = useDiagnosisJourney;
