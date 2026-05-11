import { apiRequest } from './api-client';

export type PortalJobListItem = {
  id: string;
  title: string;
  department?: string | null;
  description: string;
  location?: string | null;
  employmentType?: string | null;
  createdAt: string;
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
};

export type PortalJobDetail = PortalJobListItem & {
  requirements?: string | null;
  niceToHave?: string | null;
  screeningQuestions: string[];
  experienceMin?: number | null;
  experienceMax?: number | null;
  hiringPriority?: string | null;
};

export const portalApi = {
  listAllJobs: async (input?: { search?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (input?.search) params.set('search', input.search);
    if (input?.page) params.set('page', String(input.page));
    if (input?.limit) params.set('limit', String(input.limit));
    const query = params.toString();
    return apiRequest<{
      items: PortalJobListItem[];
      total: number;
      page: number;
      limit: number;
      totalPages?: number;
    }>(`/portal/jobs${query ? `?${query}` : ''}`);
  },

  getJob: async (jobId: string) => {
    return apiRequest<PortalJobDetail>(`/portal/jobs/${jobId}`);
  },
};

