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
    /** Ignored when `permissionKeys` is non-empty (custom role). */
    roleName?: string;
    /** Required when using custom `permissionKeys` — label for the role (email / audit). */
    position?: string;
    /** Creates a tenant role with exactly these permission keys (invite “Other”). */
    permissionKeys?: string[];
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

/** Matches backend `skillWeights` JSON — weights are integers 0–10. */
export type SkillWeight = { skill: string; weight: number };

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
  skillWeights?: SkillWeight[] | null;
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
  get: (jobId: string) => apiRequest<CreatedJob>(`/jobs/${jobId}`, { auth: true }),

  list: (params?: { page?: number; limit?: number; status?: string; department?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.limit != null) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.department) qs.set('department', params.department);
    const q = qs.toString();
    return apiRequest<PaginatedJobsResponse>(`/jobs${q ? `?${q}` : ''}`, { auth: true });
  },

  get: (jobId: string) => apiRequest<CreatedJob>(`/jobs/${jobId}`, { auth: true }),

  create: (payload: {
    title: string;
    description: string;
    location?: string;
    employmentType?: string;
    openings?: number;
    department?: string;
    requirements?: string;
    niceToHave?: string;
    skillWeights?: SkillWeight[];
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
      skillWeights?: SkillWeight[];
    }>,
  ) => apiRequest<CreatedJob>(`/jobs/${jobId}`, { method: 'PATCH', auth: true, body: payload }),

  publish: (jobId: string) => apiRequest<CreatedJob>(`/jobs/${jobId}/publish`, { method: 'POST', auth: true }),
  pause: (jobId: string) => apiRequest<CreatedJob>(`/jobs/${jobId}/pause`, { method: 'POST', auth: true }),
  close: (jobId: string) => apiRequest<CreatedJob>(`/jobs/${jobId}/close`, { method: 'POST', auth: true }),
  delete: (jobId: string) => apiRequest<void>(`/jobs/${jobId}`, { method: 'DELETE', auth: true }),
};

export type ApiCandidate = {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  resumeUrl?: string | null;
  resumeMimeType?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  skills: string[];
  location?: string | null;
  source?: string | null;
  currentCompany?: string | null;
  yearsOfExperience?: number | null;
  expectedSalary?: number | null;
  noticePeriod?: number | null;
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedCandidatesResponse = {
  items: ApiCandidate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateCandidatePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  resumeUrl?: string;
  resumeMimeType?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  location?: string;
  source?: 'referral' | 'linkedin' | 'job_board' | 'direct' | 'other';
  currentCompany?: string;
  yearsOfExperience?: number;
  expectedSalary?: number;
  noticePeriod?: number;
};

export const candidatesApi = {
  list: (params?: { page?: number; limit?: number; status?: string; skills?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page != null) qs.set('page', String(params.page));
    if (params?.limit != null) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.skills) qs.set('skills', params.skills);
    const q = qs.toString();
    return apiRequest<PaginatedCandidatesResponse>(`/candidates${q ? `?${q}` : ''}`, { auth: true });
  },

  get: (id: string) => apiRequest<ApiCandidate>(`/candidates/${id}`, { auth: true }),

  create: (payload: CreateCandidatePayload) =>
    apiRequest<ApiCandidate>('/candidates', { method: 'POST', auth: true, body: payload }),

  update: (id: string, payload: Partial<CreateCandidatePayload>) =>
    apiRequest<ApiCandidate>(`/candidates/${id}`, { method: 'PATCH', auth: true, body: payload }),

  updateStatus: (id: string, status: ApiCandidate['status']) =>
    apiRequest<ApiCandidate>(`/candidates/${id}/status`, { method: 'PATCH', auth: true, body: { status } }),

  uploadResume: async (file: File): Promise<{ url: string; mimeType: string; filename: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kofeko_access_token') : null;
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch(`${API_BASE}/candidates/upload-resume`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error((err as { message: string }).message || 'Upload failed');
    }
    const payload = await res.json() as { data: { url: string; mimeType: string; filename: string } };
    return payload.data;
  },
};

export type ApiPipeline = {
  id: string;
  jobId: string;
  candidateId: string;
  stage: 'applied' | 'screening' | 'technical_interview' | 'hr_interview' | 'offer' | 'hired' | 'rejected';
  decisionNote?: string | null;
  assignedTo?: string | null;
  slaDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    title: string;
  };
  evaluation?: {
    id: string;
    score: number;
    summary?: string;
    whyCard?: string;
    roleFitNotes?: string;
    aiGenerated: boolean;
    skillMatches?: any[];
    rankingSummary?: string;
  } | null;
  evaluations?: any[]; // for backwards compatibility if needed
};

export type PaginatedPipelinesResponse = {
  items: ApiPipeline[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const pipelinesApi = {
  list: (params: { jobId: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    qs.set('jobId', params.jobId);
    if (params.page != null) qs.set('page', String(params.page));
    if (params.limit != null) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiRequest<PaginatedPipelinesResponse>(`/pipelines?${q}`, { auth: true });
  },

  advance: (id: string, payload: { stage: string; note?: string }) =>
    apiRequest<ApiPipeline>(`/pipelines/${id}/advance`, { method: 'POST', auth: true, body: payload }),

  assign: (id: string, userId: string) =>
    apiRequest<ApiPipeline>(`/pipelines/${id}/assign`, { method: 'POST', auth: true, body: { userId } }),

  setSLA: (id: string, deadline: string) =>
    apiRequest<ApiPipeline>(`/pipelines/${id}/sla`, { method: 'POST', auth: true, body: { deadline } }),
};

export const evaluationsApi = {
  aiEvaluate: (payload: { jobId: string; candidateId: string; pipelineId?: string }) =>
    apiRequest<any>('/evaluations/ai-evaluate', { method: 'POST', auth: true, body: payload }),

  get: (id: string) => apiRequest<any>(`/evaluations/${id}`, { auth: true }),

  update: (id: string, payload: { score?: number; whyCard?: string }) =>
    apiRequest<any>(`/evaluations/${id}`, { method: 'PATCH', auth: true, body: payload }),

  evaluateAll: (jobId: string) =>
    apiRequest<any>(`/jobs/${jobId}/evaluate-all`, { method: 'POST', auth: true }),

  getRankings: (jobId: string) =>
    apiRequest<any[]>(`/jobs/${jobId}/rankings`, { auth: true }),
};
