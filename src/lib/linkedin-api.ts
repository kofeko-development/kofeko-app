import { apiRequest, API_BASE_URL, getAccessToken } from './api-client';

export type LinkedInPreview = {
  postText: string;
  shareUrl: string;
  portalUrl: string;
  charCount: number;
  charLimit: number;
  imageUrl: string | null;
  hasShareImage: boolean;
  hasImage?: boolean;
};

export type LinkedInConnectionDetails = {
  id: string;
  name?: string | null;
  email?: string | null;
  connectedAt?: string | null;
  isExpired?: boolean;
  grantedScopes?: string[];
  canPostAsCompanyPage?: boolean;
  orgDiscoveryHint?: string | null;
  hasOrgPage?: boolean;
  orgName?: string | null;
  orgId?: string | null;
  postAsOrg?: boolean;
  willPostAs?: string;
};

export type LinkedInStatus = {
  connected: boolean;
  orgScopesEnabled?: boolean;
  connections?: LinkedInConnectionDetails[];
};

export type LinkedInPostResult = {
  postId: string;
  postUrl: string | null;
  status: 'published';
  postedAs: string;
  postedAsOrg: boolean;
  postedAt: string;
};

export type LinkedInPostRecord = {
  id: string;
  tenantId: string;
  jobId: string;
  postedByUserId: string;
  linkedInPostId?: string | null;
  postUrl?: string | null;
  shareUrl?: string | null;
  postText: string;
  imageUrl?: string | null;
  postedAsOrg?: boolean | null;
  postedOrgName?: string | null;
  postedPersonName?: string | null;
  tier: number;
  status: 'generated' | 'shared' | 'published' | 'failed';
  errorMessage?: string | null;
  postedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const linkedInApi = {
  preview(jobId: string) {
    return apiRequest<LinkedInPreview>(`/linkedin/preview/${jobId}`, { auth: true });
  },

  recordCopy(input: { jobId: string; postText: string }) {
    return apiRequest<LinkedInPostRecord>(`/linkedin/record-copy`, {
      method: 'POST',
      auth: true,
      body: input,
    });
  },

  recordShare(input: { jobId: string; postText: string; shareUrl: string }) {
    return apiRequest<LinkedInPostRecord>(`/linkedin/record-share`, {
      method: 'POST',
      auth: true,
      body: input,
    });
  },

  authUrl() {
    return apiRequest<{ url: string }>(`/linkedin/auth`, { auth: true });
  },

  status() {
    return apiRequest<LinkedInStatus>(`/linkedin/status`, { auth: true });
  },

  updatePreference(connectionId: string, postAsOrg: boolean) {
    return apiRequest<{ postAsOrg: boolean }>(`/linkedin/preference/${connectionId}`, {
      method: 'PATCH',
      auth: true,
      body: { postAsOrg },
    });
  },

  refreshOrganization(connectionId: string) {
    return apiRequest<{ orgId: string; orgName: string | null }>(`/linkedin/refresh-organization/${connectionId}`, {
      method: 'POST',
      auth: true,
    });
  },

  setOrganization(connectionId: string, orgId: string, orgName?: string) {
    return apiRequest<{ orgId: string; orgName: string | null; canPostAsCompanyPage: boolean }>(
      `/linkedin/organization/${connectionId}`,
      {
        method: 'PATCH',
        auth: true,
        body: { orgId, orgName },
      },
    );
  },

  disconnect(connectionId: string) {
    return apiRequest<null>(`/linkedin/disconnect/${connectionId}`, { method: 'DELETE', auth: true });
  },

  autoPost(input: { jobId: string; customText?: string; connectionIds?: string[] }) {
    return apiRequest<LinkedInPostResult[]>(`/linkedin/post`, {
      method: 'POST',
      auth: true,
      body: input,
    });
  },

  async uploadJobImage(jobId: string, file: File): Promise<{ imageUrl: string }> {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE_URL}/linkedin/jobs/${jobId}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({ message: 'Upload failed' }))) as {
        message?: string;
      };
      throw new Error(err.message ?? 'Upload failed');
    }
    const payload = (await res.json()) as { data: { imageUrl: string } };
    return payload.data;
  },

  clearJobImage(jobId: string) {
    return apiRequest<{ imageUrl: null }>(`/linkedin/jobs/${jobId}/image`, {
      method: 'DELETE',
      auth: true,
    });
  },

  jobPosts(jobId: string) {
    return apiRequest<Array<LinkedInPostRecord & { postedByUser?: { firstName: string; lastName: string } }>>(
      `/linkedin/posts/${jobId}`,
      { auth: true },
    );
  },

  allPosts(page = 1, limit = 10) {
    return apiRequest<{
      items: Array<
        LinkedInPostRecord & {
          job?: { id: string; title: string };
          postedByUser?: { firstName: string; lastName: string };
        }
      >;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/linkedin/posts?page=${page}&limit=${limit}`, { auth: true });
  },
};
