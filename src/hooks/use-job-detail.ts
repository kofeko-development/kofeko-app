import { useQuery, useQueryClient } from '@tanstack/react-query';
import { evaluationsApi, jobsApi, pipelinesApi } from '@/lib/stage1-2-api';

export function useJobDetail(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId),
    enabled: Boolean(jobId) && enabled,
  });
}

export function useJobApplicantsData(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ['job-applicants', jobId],
    queryFn: async () => {
      const [pipeRes, rankingsRes] = await Promise.all([
        pipelinesApi.list({ jobId, limit: 100 }),
        evaluationsApi.getRankings(jobId).catch(() => []),
      ]);
      return { pipeRes, rankingsRes };
    },
    enabled: Boolean(jobId) && enabled,
  });
}

export function useInvalidateJobDetail() {
  const queryClient = useQueryClient();
  return async (jobId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['job', jobId] }),
      queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] }),
      queryClient.invalidateQueries({ queryKey: ['jobs'] }),
    ]);
  };
}
