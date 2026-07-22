import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { TableRowsSkeleton } from './table-rows-skeleton';

type DashboardJobsSkeletonProps = {
  title?: string;
  tableCols?: number;
};

export function DashboardJobsSkeleton({ tableCols = 5 }: DashboardJobsSkeletonProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:max-w-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-9 w-28" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: tableCols }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRowsSkeleton rows={4} cols={tableCols} />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
