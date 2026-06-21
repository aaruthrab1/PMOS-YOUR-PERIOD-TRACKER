import { usePersonalization } from '@/contexts/PersonalizationContext';
import { HealthJourneySection } from './HealthJourneySection';

/** Diagnosis journey timeline — visual progress steps with expandable detail */
export function DiagnosisJourneySection() {
  const { t } = usePersonalization();
  return (
    <section id="diagnosis-journey" aria-labelledby="diagnosis-journey-heading">
      <h2 id="diagnosis-journey-heading" className="section-label mb-3">
        {t('care.journey')}
      </h2>
      <HealthJourneySection />
    </section>
  );
}
