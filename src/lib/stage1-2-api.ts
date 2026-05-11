import { apiRequest } from './api-client';

export type CompanyProfilePayload = {
  companyName: string;
  industry: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  companyType: 'startup' | 'enterprise' | 'agency' | 'non_profit';
  foundedYear: number;
  companyWebsite: string;
  officialCompanyAddress: string;
  phoneNumber?: string;
  companyLogo: string;
  shortDescription: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  termsAccepted: true;
};

export type CompanyProfileResponse = {
  tenant: { id: string; name: string; slug: string };
  company: CompanyProfilePayload & { id: string; createdAt: string; updatedAt: string };
};

export const stageOneApi = {
  inviteUser: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    roleName?: string;
    position?: string;
  }) => apiRequest('/users/invite', { method: 'POST', auth: true, body: payload }),
  acceptInvite: (payload: { token: string; password: string }) =>
    apiRequest('/auth/accept-invite', { method: 'POST', body: payload }),
  forgotPassword: (payload: { tenantSlug: string; email: string }) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: payload }),
  resetPassword: (payload: { token: string; password: string }) =>
    apiRequest('/auth/reset-password', { method: 'POST', body: payload }),
};

export const companyApi = {
  get: () => apiRequest<CompanyProfileResponse>('/company', { auth: true }),
  create: (payload: CompanyProfilePayload) =>
    apiRequest<CompanyProfileResponse>('/company', { method: 'POST', auth: true, body: payload }),
  update: (payload: Partial<CompanyProfilePayload>) =>
    apiRequest<CompanyProfileResponse>('/company', { method: 'PATCH', auth: true, body: payload }),
};

export const aiApi = {
  generateJd: (payload: {
    jobTitle: string;
    requirements: string;
    location?: string;
    jobType?: string;
    employmentType?: string;
  }) => apiRequest<{ html: string }>('/ai/jd', { method: 'POST', auth: true, body: payload }),
};

export type CreatedJob = {
  id: string;
  title: string;
  description: string;
  status: string;
  tenantId: string;
  location?: string | null;
  employmentType?: string | null;
  department?: string | null;
  requirements?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedJobsResponse = {
  items: CreatedJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const jobsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; department?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.limit != null) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.department) qs.set('department', params.department);
    const q = qs.toString();
    return apiRequest<PaginatedJobsResponse>(`/jobs${q ? `?${q}` : ''}`, { auth: true });
  },

  create: (payload: {
    title: string;
    description: string;
    location?: string;
    employmentType?: string;
    openings?: number;
    department?: string;
    requirements?: string;
    niceToHave?: string;
  }) => apiRequest<CreatedJob>('/jobs', { method: 'POST', auth: true, body: payload }),

  update: (
    jobId: string,
    payload: Partial<{
      title: string;
      description: string;
      location?: string;
      employmentType?: string;
      openings?: number;
      department?: string;
      requirements?: string;
      niceToHave?: string;
    }>,
  ) => apiRequest<CreatedJob>(`/jobs/${jobId}`, { method: 'PATCH', auth: true, body: payload }),

  publish: (jobId: string) => apiRequest<CreatedJob>(`/jobs/${jobId}/publish`, { method: 'POST', auth: true }),
};
