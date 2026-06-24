import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CompanyProfileSkeleton() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-24">
      <div className="relative">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="absolute -bottom-6 left-8 flex items-end gap-6">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <div className="space-y-2 pb-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((__, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
