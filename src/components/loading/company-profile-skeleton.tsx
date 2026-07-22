import { Skeleton } from '@/components/ui/skeleton';

export function CompanyProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24">
      {/* Profile Header */}
      <div className="flex items-center gap-6 group pt-4">
        <Skeleton className="h-24 w-24 rounded-2xl border shrink-0" />
        <div className="flex flex-col justify-center gap-2">
          <Skeleton className="h-9 w-64" />
          <div className="flex items-center gap-4 mt-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border-none shadow-none bg-transparent">
              <div className="pb-6">
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="min-h-[120px] w-full rounded-xl" />
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card shadow-sm p-6">
              <div className="mb-6">
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="min-h-[80px] w-full rounded-lg" />
                </div>
                <div className="pt-4 space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
