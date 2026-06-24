import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function InboxListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card>
          <CardContent className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 border-b pb-3 last:border-0">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
