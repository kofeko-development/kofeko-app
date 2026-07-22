import { useQuery, useQueryClient } from '@tanstack/react-query';
import { portalApi } from '@/lib/portal-api';

export const portalJobsQueryKey = (params?: { search?: string; page?: number; limit?: number }) =>
  ['portal-jobs', params ?? { page: 1, limit: 100 }] as const;

export const myApplicationsQueryKey = (params?: { page?: number; limit?: number }) =>
  ['my-applications', params ?? { page: 1, limit: 100 }] as const;

export const portalJobQueryKey = (jobId: string) => ['portal-job', jobId] as const;

export const applicationDetailQueryKey = (pipelineId: string) => ['application-detail', pipelineId] as const;

export function usePortalJobs(
  params: { search?: string; page?: number; limit?: number } = { page: 1, limit: 100 },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: portalJobsQueryKey(params),
    queryFn: () => portalApi.listAllJobs(params),
    enabled: options?.enabled ?? true,
  });
}

export function useMyApplications(
  params: { page?: number; limit?: number } = { page: 1, limit: 100 },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: myApplicationsQueryKey(params),
    queryFn: () => portalApi.getMyApplications(params),
    enabled: options?.enabled ?? true,
  });
}

export function usePortalJob(jobId: string, enabled = true) {
  return useQuery({
    queryKey: portalJobQueryKey(jobId),
    queryFn: () => portalApi.getJob(jobId),
    enabled: Boolean(jobId) && enabled,
  });
}

export function useApplicationDetail(pipelineId: string, enabled = true) {
  return useQuery({
    queryKey: applicationDetailQueryKey(pipelineId),
    queryFn: async () => {
      const application = await portalApi.getMyApplicationById(pipelineId);
      const job =
        application.job?.id != null ? await portalApi.getJob(application.job.id) : null;
      return { application, job };
    },
    enabled: Boolean(pipelineId) && enabled,
  });
}

export function useInvalidatePortalApplications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['my-applications'] });
}
