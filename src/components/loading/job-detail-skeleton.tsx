import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { TableRowsSkeleton } from './table-rows-skeleton';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type JobApplicantsTableSkeletonProps = {
  cols?: number;
  rows?: number;
};

export function JobApplicantsTableSkeleton({ cols = 5, rows = 5 }: JobApplicantsTableSkeletonProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              {cols > 4 && (
                <TableHead>
                  <Skeleton className="h-4 w-14" />
                </TableHead>
              )}
              <TableHead className="text-right">
                <Skeleton className="ml-auto h-4 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRowsSkeleton rows={rows} cols={cols} />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function JobDetailHeaderSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-64 max-w-[min(100%,20rem)]" />
      <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3.5 w-14" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-36 max-w-[50vw]" />
            <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
          </div>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <Card>
        <CardContent className="grid items-end gap-3 pt-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 lg:col-span-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
        <Separator />
        <CardFooter className="justify-end px-6 py-2.5">
          <Skeleton className="h-9 w-28" />
        </CardFooter>
      </Card>

      <JobApplicantsTableSkeleton />
    </div>
  );
}
