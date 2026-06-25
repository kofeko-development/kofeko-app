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
  roles?: string[];
  roleLabels?: string[];
};

type ApiCandidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentCompany?: string | null;
  status: string;
  applications?: { job: { title: string } }[];
};

function mapBackendRolesToUser(roles: string[] | undefined): Pick<User, 'role' | 'companyRole' | 'backendRoles'> {
  const backendRoles = roles ?? [];
  const isOperator = backendRoles.includes('company_admin');

  let companyRole: User['companyRole'];
  if (backendRoles.includes('company_admin')) companyRole = 'Company Admin';
  else if (backendRoles.includes('hr_manager')) companyRole = 'Hiring Manager';
  else if (backendRoles.includes('recruiter')) companyRole = 'Recruiter';
  else if (backendRoles.includes('interviewer')) companyRole = 'Interviewer';

  return {
    role: isOperator ? 'operator' : 'recruiter',
    companyRole,
    backendRoles,
  };
}

export function mapStaffUserToDisplay(u: ApiStaffUser): User {
  const name = `${u.firstName} ${u.lastName}`.trim();
  const status: User['status'] =
    u.status === 'invited' ? 'pending' : u.status === 'suspended' ? 'suspended' : 'active';
  const roleMapping = mapBackendRolesToUser(u.roles);
  const customLabel = u.roleLabels?.find(Boolean);
  let companyRole = roleMapping.companyRole;
  if (customLabel) {
    if (customLabel === 'HR Manager') companyRole = 'Hiring Manager';
    else if (customLabel === 'Recruiter') companyRole = 'Recruiter';
    else if (customLabel === 'Technical Interviewer') companyRole = 'Interviewer';
    else companyRole = customLabel as User['companyRole'];
  }
  return {
    uid: u.id,
    email: u.email,
    name: name || u.email,
    status,
    ...roleMapping,
    companyRole,
  };
}

/** Staff invited to the org (excludes the primary company admin account). */
export function isRecruiterManagementUser(user: User): boolean {
  const roles = user.backendRoles ?? [];
  if (roles.includes('company_admin')) return false;
  return roles.some(
    (role) =>
      role === 'recruiter' ||
      role === 'hr_manager' ||
      role === 'interviewer' ||
      role.startsWith('custom_'),
  );
}

/** @deprecated use isRecruiterManagementUser */
export function isRecruiterStaffUser(user: User): boolean {
  return isRecruiterManagementUser(user);
}

export function staffInviteStatusLabel(status: User['status'] | undefined): string {
  if (status === 'pending') return 'Pending';
  if (status === 'active') return 'Accepted';
  if (status === 'suspended') return 'Suspended';
  return 'Pending';
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
  const appliedRole = c.applications && c.applications.length > 0 
    ? c.applications.map(a => a.job?.title).filter(Boolean).join(', ') 
    : undefined;
  return {
    uid: c.id,
    email: c.email,
    name: name || c.email,
    role: 'candidate',
    appliedRole,
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

// Proxies to candidatesApi
import { candidatesApi, CreateCandidatePayload } from './stage1-2-api';

export async function createCandidate(payload: CreateCandidatePayload) {
  return candidatesApi.create(payload);
}

export async function uploadResume(file: File) {
  return candidatesApi.uploadResume(file);
}
