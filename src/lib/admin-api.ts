import { apiRequest } from './api-client';
import type { User } from './types';

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const MAX_PAGE_LIMIT = 100;
const clampLimit = (limit: number) => Math.max(1, Math.min(MAX_PAGE_LIMIT, Math.floor(limit)));

type ApiStaffUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'invited' | 'suspended';
};

type ApiCandidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentCompany?: string | null;
  status: string;
};

export function mapStaffUserToDisplay(u: ApiStaffUser): User {
  const name = `${u.firstName} ${u.lastName}`.trim();
  const status: User['status'] =
    u.status === 'invited' ? 'pending' : u.status === 'suspended' ? 'suspended' : 'active';
  return {
    uid: u.id,
    email: u.email,
    name: name || u.email,
    role: 'recruiter',
    status,
  };
}

function mapCandidateStatusToUserStatus(status: string): User['status'] {
  switch (status) {
    case 'rejected':
      return 'suspended';
    case 'new':
    case 'screening':
      return 'pending';
    default:
      return 'active';
  }
}

export function mapCandidateToDisplayUser(c: ApiCandidate): User {
  const name = `${c.firstName} ${c.lastName}`.trim();
  return {
    uid: c.id,
    email: c.email,
    name: name || c.email,
    role: 'candidate',
    company: c.currentCompany ?? undefined,
    status: mapCandidateStatusToUserStatus(c.status),
  };
}

export async function listStaffUsers(page = 1, limit = 100) {
  const safeLimit = clampLimit(limit);
  return apiRequest<Paginated<ApiStaffUser>>(`/users?page=${page}&limit=${safeLimit}`, { auth: true });
}

export async function listCandidates(page = 1, limit = 100) {
  const safeLimit = clampLimit(limit);
  return apiRequest<Paginated<ApiCandidate>>(`/candidates?page=${page}&limit=${safeLimit}`, { auth: true });
}

export type StaffUserStatus = 'active' | 'invited' | 'suspended';

export async function updateStaffUserStatus(userId: string, status: StaffUserStatus) {
  return apiRequest<ApiStaffUser>(`/users/${userId}`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });
}

export function displayStatusToStaffStatus(status: NonNullable<User['status']>): StaffUserStatus {
  if (status === 'pending') return 'invited';
  return status;
}

export async function updateStaffUserRole(userId: string, roleName: string) {
  return apiRequest<ApiStaffUser>(`/users/${userId}`, {
    method: 'PATCH',
    auth: true,
    body: { roleName },
  });
}

export async function removeStaffUser(userId: string) {
  return apiRequest<void>(`/users/${userId}`, {
    method: 'DELETE',
    auth: true,
  });
}
