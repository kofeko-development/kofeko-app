import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listStaffUsers } from '@/lib/admin-api';

export const teamQueryKey = (params?: { page?: number; limit?: number }) =>
  ['team', params ?? { page: 1, limit: 100 }] as const;

export function useTeamList(
  params: { page?: number; limit?: number } = { page: 1, limit: 100 },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: teamQueryKey(params),
    queryFn: () => listStaffUsers(params.page ?? 1, params.limit ?? 100),
    enabled: options?.enabled ?? true,
  });
}

export function useInvalidateTeam() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['team'] });
}
