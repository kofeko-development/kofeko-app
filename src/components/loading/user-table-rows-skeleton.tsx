import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

type UserTableRowsSkeletonProps = {
  rows?: number;
  /** `manage` = Manage dropdown button; `minimal` = dash / no actions */
  actionVariant?: 'manage' | 'minimal';
};

export function UserTableRowsSkeleton({ rows = 6, actionVariant = 'manage' }: UserTableRowsSkeletonProps) {
  const actionClass =
    actionVariant === 'manage' ? 'ml-auto h-8 w-[5.5rem] rounded-md' : 'ml-auto h-4 w-4 rounded-sm';

  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <TableRow key={row}>
          <TableCell>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className={actionClass} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
