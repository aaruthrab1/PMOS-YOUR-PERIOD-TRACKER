import { lazy, Suspense } from 'react';
import { SkeletonCard } from '@/components/ui';
import type { ClinicalReportView } from '@/lib/reports/buildClinicalReport';

const ReportClinicalChartsInner = lazy(() =>
  import('./ReportClinicalChartsInner').then((m) => ({ default: m.ReportClinicalChartsInner })),
);

interface ReportClinicalChartsProps {
  charts: ClinicalReportView['charts'];
}

export function ReportClinicalCharts({ charts }: ReportClinicalChartsProps) {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2"><SkeletonCard /><SkeletonCard /></div>}>
      <ReportClinicalChartsInner charts={charts} />
    </Suspense>
  );
}
