import type { CyraLanguageCode } from './types';
import { createTranslator } from './translations';
import type { TranslationKey } from './translations/en';

/** Localized labels for clinical PDF export and text export */
export function getReportLabels(language: CyraLanguageCode) {
  const t = createTranslator(language);
  return {
    clinicalReport: t('reports.clinicalReport'),
    preparedFor: t('reports.preparedFor'),
    healthSummary: t('reports.healthSummary'),
    profileSummary: t('reports.profileSummary'),
    cycleAnalysis: t('reports.cycleAnalysis'),
    sleepAnalysis: t('reports.sleepAnalysis'),
    moodAnalysis: t('reports.moodAnalysis'),
    androgenAnalysis: t('reports.androgenAnalysis'),
    symptomHistory: t('reports.symptomHistory'),
    riskPatterns: t('reports.riskPatterns'),
    questionsForDoctor: t('reports.questionsForDoctor'),
    recommendedTests: t('reports.recommendedTests'),
    timeline: t('reports.timeline'),
    charts: t('reports.charts'),
    disclaimer: t('reports.disclaimer'),
    downloadPdf: t('reports.downloadPdf'),
    patient: t('reports.patient'),
    generated: t('reports.generated'),
    coverSubtitle: t('reports.coverSubtitle'),
    doctorVisitReport: t('reports.doctorVisitReport'),
    reportingPeriod: t('reports.reportingPeriod'),
    confidential: t('reports.confidential'),
    pdfFooter: t('reports.pdfFooter'),
    regenerateHint: t('reports.regenerateHint'),
  };
}

export type ReportLabels = ReturnType<typeof getReportLabels>;

export function reportSectionTitle(language: CyraLanguageCode, key: TranslationKey): string {
  return createTranslator(language)(key);
}
