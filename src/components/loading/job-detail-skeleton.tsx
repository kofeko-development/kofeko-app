import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRowsSkeleton } from './table-rows-skeleton';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function JobDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Candidate</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Match</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRowsSkeleton rows={6} cols={5} />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
