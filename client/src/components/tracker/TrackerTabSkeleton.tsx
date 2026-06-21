import { Skeleton, SkeletonCard } from '@/components/ui';

export function TrackerTabSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading tracker">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-9 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      <SkeletonCard />
      <SkeletonCard />
      <Skeleton variant="rect" className="h-48 rounded-3xl" />
    </div>
  );
}
