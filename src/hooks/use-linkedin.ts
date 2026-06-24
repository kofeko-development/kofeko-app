import { useQuery, useQueryClient } from '@tanstack/react-query';
import { linkedInApi, type LinkedInStatus } from '@/lib/linkedin-api';

export const linkedInStatusQueryKey = ['linkedin-status'] as const;

export function useLinkedInStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: linkedInStatusQueryKey,
    queryFn: () => linkedInApi.status(),
    enabled: options?.enabled ?? true,
  });
}

export function useInvalidateLinkedInStatus() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: linkedInStatusQueryKey });
}

export function useSetLinkedInStatus() {
  const queryClient = useQueryClient();
  return (status: LinkedInStatus) =>
    queryClient.setQueryData(linkedInStatusQueryKey, status);
}
