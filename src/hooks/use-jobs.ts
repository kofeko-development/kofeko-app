import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jobsApi, type PaginatedJobsResponse } from '@/lib/stage1-2-api';

export const jobsQueryKey = (params?: { page?: number; limit?: number; status?: string; department?: string }) =>
  ['jobs', params ?? { page: 1, limit: 100 }] as const;

export function useJobsList(
  params: { page?: number; limit?: number; status?: string; department?: string } = { page: 1, limit: 100 },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: jobsQueryKey(params),
    queryFn: () => jobsApi.list(params),
    enabled: options?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useInvalidateJobs() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };
}

export type { PaginatedJobsResponse };
