import { lazy, Suspense } from 'react';
import { SkeletonCard } from '@/components/ui';
import type { ReportSourceSnapshot } from '@/lib/reports';

const ReportChartsPanelInner = lazy(() =>
  import('./ReportChartsPanelInner').then((m) => ({ default: m.ReportChartsPanelInner })),
);

interface ReportChartsPanelProps {
  snapshot: ReportSourceSnapshot | null;
}

export function ReportChartsPanel({ snapshot }: ReportChartsPanelProps) {
  return (
    <Suspense fallback={
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    }>
      <ReportChartsPanelInner snapshot={snapshot} />
    </Suspense>
  );
}
