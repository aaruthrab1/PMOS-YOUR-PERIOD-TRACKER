import { Card } from '@/components/ui';
import { SimpleLanguageToggle } from '@/components/androgen/SimpleLanguageToggle';
import { CycleVisualizer } from './CycleVisualizer';
import { CYCLE_PATTERNS } from '@/lib/care/cycleEducation';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { pickRegionalTip } from '@/lib/personalization';

export function CycleEducationTab() {
  const { simpleLanguage, setSimpleLanguage, region, simplify } = usePersonalization();
  const regionalTip = pickRegionalTip(region, 1);

  return (
    <div className="space-y-6 animate-slide-up">
      <Card padding="sm" className="border-border">
        <div className="flex items-start justify-between gap-3">
          <p className="text-caption text-ink-secondary leading-relaxed">
            Compare a typical 28-day cycle with a longer PMOS pattern (38–45 days). Tap any phase to learn what happens in your body.
          </p>
          <SimpleLanguageToggle enabled={simpleLanguage} onChange={setSimpleLanguage} />
        </div>
      </Card>

      <Card>
        <CycleVisualizer patterns={CYCLE_PATTERNS} simpleLanguage={simpleLanguage} />
      </Card>

      <Card variant="cycle" padding="sm">
        <p className="section-label">Why this matters</p>
        <p className="mt-2 text-caption text-ink-secondary leading-relaxed">
          {simpleLanguage
            ? simplify('PMOS often means a longer cycle and stronger symptoms in the weeks before your period. Seeing the timeline side-by-side can help you plan rest, appointments, and self-care.')
            : 'Premenstrual exacerbation (PMOS) is associated with longer cycles and amplified luteal-phase symptoms for many people. Visualizing phase length helps contextualize symptom timing.'}
        </p>
        {regionalTip && (
          <p className="mt-3 text-caption text-ink-secondary leading-relaxed border-t border-border/40 pt-3">
            {simplify(regionalTip)}
          </p>
        )}
      </Card>
    </div>
  );
}
