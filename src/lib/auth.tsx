"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from './types';
import type { CompanySizeValue } from './company-size';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, apiRequest, clearAuthStorage } from './api-client';

type LoginInput = {
  tenantSlug?: string;
  email: string;
  password: string;
};

type RegisterAdminInput = {
  /** Future company admin login (after superadmin approval). */
  adminEmail: string;
  password: string;
  companyName: string;
  companyAddress: {
    country: string;
    state: string;
    city: string;
    zipCode: string;
    fullAddress: string;
  };
  industry: string;
  companySize: CompanySizeValue;
  companyType: 'startup' | 'enterprise' | 'agency' | 'non_profit';
  foundedYear: number;
  companyWebsite: string;
  officialCompanyAddress: string;
  phoneNumber: string;
  companyLogo: string;
  shortDescription: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  termsAccepted: true;
  /** From POST /auth/register-company-email-otp/verify after confirming the email code. */
  emailVerificationToken: string;
};

type RegisterCandidateInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginCandidateInput = {
  email: string;
  password: string;
};

type LoginCandidateGoogleInput = {
  idToken: string;
};

type LoginCandidateSupabaseInput = {
  accessToken: string;
};

export type BackendUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  permissions?: string[];
  roles?: string[];
  status?: 'active' | 'invited' | 'suspended';
  phoneNumber?: string;
  resumeUrl?: string;
  summary?: string;
  education?: any[];
  workExperience?: any[];
  projects?: any[];
  hobbies?: string[];
  skills?: string[];
  linkedinUrl?: string;
};

interface AuthContextType {
  user: User | null;
  hasPermission: (permission: string) => boolean;
  login: (input: LoginInput) => Promise<User>;
  registerAdmin: (input: RegisterAdminInput) => Promise<void>;
  loginCandidate: (input: LoginCandidateInput) => Promise<User>;
  loginCandidateWithGoogle: (input: LoginCandidateGoogleInput) => Promise<User>;
  loginCandidateWithSupabase: (input: LoginCandidateSupabaseInput) => Promise<User>;
  registerCandidate: (input: RegisterCandidateInput) => Promise<User>;
  updateCurrentUser: (nextUser: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const mapBackendUser = (backendUser: BackendUser): User => {
  const fullName = `${backendUser.firstName ?? ''} ${backendUser.lastName ?? ''}`.trim();
  const permissions = backendUser.permissions ?? [];
  const roles = backendUser.roles ?? [];
  const isOperator = permissions.includes('rbac:manage') && !roles.includes('company_admin');
  /** Staff vs candidate must follow backend role names — avoid inferring from permissions (e.g. interviewers may have candidate:read). */
  const isCandidate = !isOperator && roles.includes('candidate');
  const role: User['role'] = isOperator ? 'operator' : isCandidate ? 'candidate' : 'recruiter';

  let companyRole: User['companyRole'] = undefined;
  if (roles.includes('company_admin')) companyRole = 'HR Admin';
  else if (roles.includes('hr_manager')) companyRole = 'Hiring Manager';
  else if (roles.includes('recruiter')) companyRole = 'Recruiter';
  else if (roles.includes('interviewer')) companyRole = 'Interviewer';

  return {
    uid: backendUser.id,
    email: backendUser.email,
    name: fullName || backendUser.email,
    role,
    companyRole,
    permissions,
    backendRoles: roles,
    status: backendUser.status === 'invited' ? 'pending' : backendUser.status,
    phone: backendUser.phoneNumber,
    resumeUrl: backendUser.resumeUrl,
    coverLetter: backendUser.summary,
    education: backendUser.education,
    workExperience: backendUser.workExperience,
    projects: backendUser.projects,
    hobbies: backendUser.hobbies,
    skills: backendUser.skills,
    linkedinProfileUrl: backendUser.linkedinUrl,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!storedToken) {
          return;
        }

        const me = await apiRequest<BackendUser>('/auth/me', { auth: true });
        setUser(mapBackendUser(me));
      } catch (error) {
        console.error('Failed to initialize auth session', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    void bootstrapSession();
  }, []);

  const clearSession = () => {
    setUser(null);
    clearAuthStorage();
  };

  const login = async (input: LoginInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>('/auth/login', { method: 'POST', body: input });

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);

    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const registerAdmin = async (input: RegisterAdminInput) => {
    await apiRequest('/auth/register-company-request', {
      method: 'POST',
      body: input,
    });
  };

  const registerCandidate = async (input: RegisterCandidateInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>('/auth/register-candidate', { method: 'POST', body: input });

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const loginCandidate = async (input: LoginCandidateInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>('/auth/login-candidate', { method: 'POST', body: input });

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const loginCandidateWithGoogle = async (input: LoginCandidateGoogleInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>('/auth/login-candidate-google', { method: 'POST', body: input });

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const loginCandidateWithSupabase = async (input: LoginCandidateSupabaseInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>('/auth/login-candidate-supabase', { method: 'POST', body: input });

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const updateCurrentUser = (nextUser: User) => {
    setUser(nextUser);
  };

  const hasPermission = (permission: string) => Boolean(user?.permissions?.includes(permission));

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (refreshToken) {
      try {
        await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } });
      } catch (error) {
        console.error('Logout request failed', error);
      }
    }

    clearSession();
    window.location.href = '/';
  };

  const value = {
    user,
    hasPermission,
    login,
    registerAdmin,
    loginCandidate,
    loginCandidateWithGoogle,
    loginCandidateWithSupabase,
    registerCandidate,
    updateCurrentUser,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
