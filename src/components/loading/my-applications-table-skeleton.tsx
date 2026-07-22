import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

type MyApplicationsTableSkeletonProps = {
  rows?: number;
};

export function MyApplicationsTableSkeleton({ rows = 5 }: MyApplicationsTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <TableRow key={row}>
          <TableCell className="pl-6">
            <Skeleton className="h-4 w-44" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-28 rounded-full" />
          </TableCell>
          <TableCell className="pr-6 text-right">
            <Skeleton className="ml-auto h-8 w-28 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
