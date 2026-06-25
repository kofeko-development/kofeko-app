import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';
import { companyApi } from '@/lib/stage1-2-api';

export const companyProfileQueryKey = ['company-profile'] as const;

export function useCompanyProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: companyProfileQueryKey,
    queryFn: async () => {
      try {
        return await companyApi.get();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInvalidateCompanyProfile() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: companyProfileQueryKey });
}
