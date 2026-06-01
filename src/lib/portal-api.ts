import { apiRequest } from './api-client';

export type PortalJobListItem = {
  id: string;
  title: string;
  department?: string | null;
  description: string;
  location?: string | null;
  employmentType?: string | null;
  createdAt: string;
  customStages?: {
    stage: string;
    label: string;
    order: number;
    enabled: boolean;
  }[] | null;
  tenant: {
    id: string;
    slug: string;
    name: string;
    company?: {
      industry: string;
      companySize: string;
      companyType: string;
      companyLogo: string;
      shortDescription: string;
    } | null;
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

  apply: async (tenantSlug: string, jobId: string, payload: { resumeUrl: string; resumeMimeType?: string; coverLetter?: string }) => {
    return apiRequest<{
      pipelineId: string;
      jobTitle: string;
      stage: string;
      appliedAt: string;
    }>(`/portal/${tenantSlug}/jobs/${jobId}/apply`, {
      method: 'POST',
      auth: true,
      authType: 'candidate',
      body: payload,
    });
  },

  getMyApplications: async (params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.limit != null) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiRequest<{
      items: Array<{
        pipelineId: string;
        job: { id: string; title: string; department?: string };
        stage: string;
        appliedAt: string;
        updatedAt: string;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/portal/my-applications${q ? `?${q}` : ''}`, {
      auth: true,
      authType: 'candidate',
    });
  },

  getMyApplicationById: async (pipelineId: string) => {
    return apiRequest<{
      pipelineId: string;
      job: { id: string; title: string; department?: string };
      stage: string;
      appliedAt: string;
      updatedAt: string;
    }>(`/portal/my-applications/${pipelineId}`, {
      auth: true,
      authType: 'candidate',
    });
  },
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiRequest<{
      resumeUrl: string;
      resumeMimeType: string;
      parsed?: any;
    }>('/portal/upload-resume', {
      method: 'POST',
      auth: true,
      authType: 'candidate',
      body: formData,
    });
  },

  getMessages: async () => {
    return apiRequest<Array<{
      id: string;
      subject: string;
      body: string;
      status: string;
      createdAt: string;
    }>>('/portal/messages', {
      auth: true,
      authType: 'candidate',
    });
  },

  markMessageRead: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/portal/messages/${id}/read`, {
      method: 'PATCH',
      auth: true,
      authType: 'candidate',
    });
  },

  archiveMessage: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/portal/messages/${id}/archive`, {
      method: 'PATCH',
      auth: true,
      authType: 'candidate',
    });
  },

  unarchiveMessage: async (id: string) => {
    return apiRequest<{ success: boolean }>(`/portal/messages/${id}/unarchive`, {
      method: 'PATCH',
      auth: true,
      authType: 'candidate',
    });
  },
};

