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
  inviteUser: (payload: { firstName: string; lastName: string; email: string; roleName?: string }) =>
    apiRequest('/users/invite', { method: 'POST', auth: true, body: payload }),
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
