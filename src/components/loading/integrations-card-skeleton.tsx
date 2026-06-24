import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function IntegrationsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-48" />
      </CardContent>
    </Card>
  );
}
