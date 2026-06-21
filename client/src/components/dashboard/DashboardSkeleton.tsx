import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="page-container pb-8 md:max-w-lg" aria-busy="true" aria-label="Loading dashboard">
      <div className="home-stack">
        <div>
          <Skeleton variant="text" className="mb-2 h-3 w-32" />
          <Skeleton variant="text" className="h-8 w-2/3" />
          <Skeleton variant="rect" className="mt-6 h-20 rounded-2xl" />
        </div>
        <div>
          <Skeleton variant="text" className="mb-3 h-4 w-36" />
          <Skeleton variant="rect" className="h-24 rounded-2xl" />
        </div>
        <Skeleton variant="rect" className="h-32 rounded-2xl" />
        <div className="flex gap-3 overflow-hidden">
          <Skeleton variant="rect" className="h-28 w-48 shrink-0 rounded-2xl" />
          <Skeleton variant="rect" className="h-28 w-48 shrink-0 rounded-2xl" />
        </div>
        <Skeleton variant="rect" className="h-20 rounded-2xl" />
        <Skeleton variant="rect" className="h-24 rounded-2xl" />
      </div>
    </div>
  );
}
