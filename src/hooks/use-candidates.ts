import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listCandidates } from '@/lib/admin-api';

export const candidatesQueryKey = (params?: { page?: number; limit?: number }) =>
  ['candidates', params ?? { page: 1, limit: 100 }] as const;

export function useCandidatesList(
  params: { page?: number; limit?: number } = { page: 1, limit: 100 },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: candidatesQueryKey(params),
    queryFn: () => listCandidates(params.page ?? 1, params.limit ?? 100),
    enabled: options?.enabled ?? true,
  });
}

export function useInvalidateCandidates() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['candidates'] });
}
