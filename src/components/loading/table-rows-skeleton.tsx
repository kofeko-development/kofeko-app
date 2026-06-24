import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type TableRowsSkeletonProps = {
  rows?: number;
  cols?: number;
};

export function TableRowsSkeleton({ rows = 5, cols = 4 }: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <TableRow key={row}>
          {Array.from({ length: cols }).map((_, col) => (
            <TableCell key={col}>
              <Skeleton
                className={cn(
                  'h-4',
                  col === cols - 1 && 'ml-auto w-24',
                  col === 0 && 'w-48',
                  col > 0 && col < cols - 1 && 'w-20',
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
