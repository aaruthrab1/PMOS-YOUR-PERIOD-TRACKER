import {
  RecommendedNextStepSection,
  DoctorPrepToolkitSection,
  DiagnosisJourneySection,
  ClinicFinderSection,
  KnowledgeLibrarySection,
  JourneyProgressHero,
} from '@/components/care';
import { useCareHub } from '@/hooks/useCareHub';
import { useLocalizedPageTitle } from '@/hooks/useLocalizedPageTitle';
import { usePersonalization } from '@/contexts/PersonalizationContext';

export function CarePage() {
  useLocalizedPageTitle('page.care');
  const { t } = usePersonalization();
  const { recommendedStep, journey } = useCareHub();

  return (
    <div className="page-container pb-8 md:max-w-lg page-enter">
      <header className="mb-8">
        <h1 className="font-display text-display-sm text-ink tracking-tight">{t('care.title')}</h1>
        <p className="mt-2 text-body text-ink-secondary leading-relaxed">{t('care.subtitle')}</p>
      </header>

      <div className="home-stack">
        <JourneyProgressHero
          progressPercent={journey.progressPercent}
          completedCount={journey.completedCount}
          encouragement={journey.encouragement}
          currentStepId={journey.currentStepId}
        />
        <RecommendedNextStepSection step={recommendedStep} />
        <DoctorPrepToolkitSection />
        <div id="diagnosis-journey">
          <DiagnosisJourneySection />
        </div>
        <ClinicFinderSection />
        <KnowledgeLibrarySection />
      </div>
    </div>
  );
}

/** @deprecated use CarePage */
export const CareJourneyPage = CarePage;
