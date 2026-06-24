import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type FindJobsListSkeletonProps = {
  rows?: number;
};

export function FindJobsListSkeleton({ rows = 4 }: FindJobsListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-56 max-w-full" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full max-w-2xl" />
                <Skeleton className="h-3 w-3/4 max-w-xl" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 shrink-0 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
