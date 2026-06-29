'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from './types';
import type { CompanySizeValue } from './company-size';
import {
  API_BASE_URL,
  AUTH_TYPE_KEY,
  SESSION_EXPIRED_EVENT,
  STAFF_TOKEN_KEY,
  STAFF_REFRESH_KEY,
  CANDIDATE_TOKEN_KEY,
  CANDIDATE_REFRESH_KEY,
  SUPERADMIN_TOKEN_KEY,
  SUPERADMIN_REFRESH_KEY,
  LEGACY_ACCESS_KEY,
  LEGACY_REFRESH_KEY,
  setTokens,
  clearTokens,
  getAuthType,
  getAccessToken,
  getRefreshToken,
  ApiError,
  apiRequest,
  type AuthType,
} from './api-client';
import {
  readCachedUser,
  writeCachedUser,
  clearAllSessionCaches,
  readCachedSuperAdmin,
  writeCachedSuperAdmin,
} from './session-cache';
import { clearAuthRouteHint, resolveAuthRouteHint, setAuthRouteHint } from './auth-hint';

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
  companyLogo?: string;
  shortDescription: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  termsAccepted: true;
  /** From POST /auth/register-company-email-otp/verify after confirming the email code. */
  emailVerificationToken?: string;
};

type RegisterCandidateInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  emailVerificationToken?: string;
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
  resumeMimeType?: string;
  tenant?: {
    name: string;
    slug?: string;
  };
};

interface AuthContextType {
  user: User | null;
  superAdmin: BackendSuperAdmin | null;
  hasPermission: (permission: string) => boolean;
  login: (input: LoginInput) => Promise<User>;
  registerAdmin: (input: RegisterAdminInput) => Promise<any>;
  loginCandidate: (input: LoginCandidateInput) => Promise<User>;
  loginCandidateWithGoogle: (input: LoginCandidateGoogleInput) => Promise<User>;
  loginCandidateWithSupabase: (input: LoginCandidateSupabaseInput) => Promise<User>;
  loginSuperAdmin: (input: { email: string; password: string }) => Promise<void>;
  registerCandidate: (input: RegisterCandidateInput) => Promise<User>;
  updateCurrentUser: (nextUser: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

type BackendSuperAdmin = { id: string; email: string; firstName: string; lastName: string };

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const mapBackendUser = (backendUser: BackendUser): User => {
  const fullName = `${backendUser.firstName ?? ''} ${backendUser.lastName ?? ''}`.trim();
  const permissions = backendUser.permissions ?? [];
  const roles = backendUser.roles ?? [];
  const isOperator = permissions.includes('rbac:manage') && !roles.includes('company_admin');
  const isCandidateByRole = roles.includes('candidate');
  const isCandidateByPermission =
    !isOperator &&
    !roles.length &&
    permissions.includes('job:read') &&
    !permissions.includes('pipeline:create') &&
    !permissions.includes('candidate:create') &&
    !permissions.includes('user:read');
  const isCandidate = !isOperator && (isCandidateByRole || isCandidateByPermission);
  const role: User['role'] = isOperator ? 'operator' : isCandidate ? 'candidate' : 'recruiter';

  let companyRole: User['companyRole'] = undefined;
  if (roles.includes('company_admin')) companyRole = 'Company Admin';
  else if (roles.includes('hr_manager')) companyRole = 'Hiring Manager';
  else if (roles.includes('recruiter')) companyRole = 'Recruiter';
  else if (roles.includes('interviewer')) companyRole = 'Interviewer';

  return {
    uid: backendUser.id,
    email: backendUser.email,
    name: fullName || backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    role,
    companyRole,
    company: !isCandidate ? backendUser.tenant?.name?.trim() || undefined : undefined,
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
    resumeMimeType: backendUser.resumeMimeType,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [superAdmin, setSuperAdmin] = useState<BackendSuperAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const legacyToken = localStorage.getItem(LEGACY_ACCESS_KEY);
        const legacyRefresh = localStorage.getItem(LEGACY_REFRESH_KEY);
        const hasLegacy = Boolean(legacyToken && legacyRefresh);
        const hasNewType = Boolean(localStorage.getItem(AUTH_TYPE_KEY));

        if (hasLegacy && !hasNewType) {
          localStorage.setItem(STAFF_TOKEN_KEY, legacyToken!);
          localStorage.setItem(STAFF_REFRESH_KEY, legacyRefresh!);
          localStorage.setItem(AUTH_TYPE_KEY, 'staff');
          localStorage.removeItem(LEGACY_ACCESS_KEY);
          localStorage.removeItem(LEGACY_REFRESH_KEY);
        }

        const authType = getAuthType();

        if (!authType) {
          setLoading(false);
          return;
        }

        const token = getAccessToken(authType);
        if (!token) {
          clearTokens(authType);
          setLoading(false);
          return;
        }

        // Instant UI: hydrate from session cache while /me validates in background
        if (authType === 'super_admin') {
          const cachedAdmin = readCachedSuperAdmin();
          if (cachedAdmin) {
            setSuperAdmin(cachedAdmin);
          }
        } else {
          const cachedUser = readCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
          }
        }

        if (authType === 'super_admin') {
          const me = await apiRequest<BackendSuperAdmin>('/superadmin/auth/me', {
            auth: true,
            authType: 'super_admin',
          });
          setSuperAdmin(me);
          writeCachedSuperAdmin(me);
          setAuthRouteHint('super_admin');
          setLoading(false);
          return;
        }

        if (authType === 'candidate') {
          const me = await apiRequest<BackendUser>('/portal/auth/me', {
            auth: true,
            authType: 'candidate',
          });
          const mapped = mapBackendUser({
            ...me,
            roles: me.roles?.length ? me.roles : ['candidate'],
          });
          setUser(mapped);
          writeCachedUser(mapped);
          setAuthRouteHint('candidate');
          setLoading(false);
          return;
        }

        const me = await apiRequest<BackendUser>('/auth/me', {
          auth: true,
          authType: 'staff',
        });
        const mapped = mapBackendUser(me);
        setUser(mapped);
        writeCachedUser(mapped);
        setAuthRouteHint(resolveAuthRouteHint(mapped.permissions, mapped.backendRoles));
        setLoading(false);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
          clearTokens();
          clearAllSessionCaches();
          clearAuthRouteHint();
          setUser(null);
          setSuperAdmin(null);
        } else if (error instanceof ApiError) {
          console.warn('Session bootstrap non-fatal error:', error.message);
        } else {
          const cached = readCachedUser();
          if (cached) setUser(cached);
        }
        setLoading(false);
      }
    };

    void bootstrapSession();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // If AUTH_TYPE_KEY was cleared in another tab → log out this tab too
      if (event.key === AUTH_TYPE_KEY && event.newValue === null) {
        setUser(null);
        setSuperAdmin(null);
      }

      // If a new login happened in another tab → sync the user
      if (event.key === AUTH_TYPE_KEY && event.newValue === 'staff') {
        // Re-run bootstrap to load the new staff session
        apiRequest<BackendUser>('/auth/me', { auth: true, authType: 'staff' })
          .then((me) => setUser(mapBackendUser(me)))
          .catch(() => {/* ignore — bootstrap will handle on next load */ });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const handleSessionExpired = () => {
      clearTokens();
      clearAllSessionCaches();
      clearAuthRouteHint();
      setUser(null);
      setSuperAdmin(null);
      window.location.href = '/company-login';
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  const login = async (input: LoginInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
      tenant?: BackendUser['tenant'];
    }>('/auth/login', { method: 'POST', body: input });

    setTokens('staff', payload.accessToken, payload.refreshToken);
    const mappedUser = mapBackendUser({
      ...payload.user,
      tenant: payload.user.tenant ?? payload.tenant,
    });
    setUser(mappedUser);
    writeCachedUser(mappedUser);
    setAuthRouteHint(resolveAuthRouteHint(mappedUser.permissions, mappedUser.backendRoles));
    return mappedUser;
  };

  const registerAdmin = async (input: RegisterAdminInput) => {
    return apiRequest<any>('/auth/register-company-request', {
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

    setTokens('candidate', payload.accessToken, payload.refreshToken);
    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    writeCachedUser(mappedUser);
    setAuthRouteHint('candidate');
    return mappedUser;
  };

  const loginCandidate = async (input: LoginCandidateInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>('/auth/login-candidate', { method: 'POST', body: input });

    setTokens('candidate', payload.accessToken, payload.refreshToken);
    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    writeCachedUser(mappedUser);
    setAuthRouteHint('candidate');
    return mappedUser;
  };

  const loginCandidateWithGoogle = async (input: LoginCandidateGoogleInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>('/auth/login-candidate-google', { method: 'POST', body: input });

    setTokens('candidate', payload.accessToken, payload.refreshToken);
    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    writeCachedUser(mappedUser);
    setAuthRouteHint('candidate');
    return mappedUser;
  };

  const loginCandidateWithSupabase = async (input: LoginCandidateSupabaseInput) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>('/auth/login-candidate-supabase', { method: 'POST', body: input });

    setTokens('candidate', payload.accessToken, payload.refreshToken);
    const mappedUser = mapBackendUser(payload.user);
    setUser(mappedUser);
    writeCachedUser(mappedUser);
    setAuthRouteHint('candidate');
    return mappedUser;
  };

  const loginSuperAdmin = async (input: { email: string; password: string }) => {
    const payload = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      superAdmin: BackendSuperAdmin;
    }>('/superadmin/auth/login', { method: 'POST', body: input });

    setTokens('super_admin', payload.accessToken, payload.refreshToken);
    setSuperAdmin(payload.superAdmin);
    writeCachedSuperAdmin(payload.superAdmin);
    setAuthRouteHint('super_admin');
  };

  const updateCurrentUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    writeCachedUser(nextUser);
  }, []);

  const permissions = user?.permissions ?? [];

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  const logout = useCallback(async () => {
    const authType = getAuthType();
    const refreshToken = getRefreshToken(authType);

    if (refreshToken) {
      try {
        const logoutPath =
          authType === 'super_admin' ? '/superadmin/auth/logout' : '/auth/logout';
        await apiRequest(logoutPath, {
          method: 'POST',
          body: { refreshToken },
          auth: true,
          authType,
        });
      } catch {
        // Always clear locally even if server logout fails
      }
    }

    clearTokens(authType);
    clearAllSessionCaches();
    clearAuthRouteHint();
    setUser(null);
    setSuperAdmin(null);
    window.location.href = authType === 'candidate' ? '/candidate-auth' : authType === 'super_admin' ? '/superadmin/login' : '/company-login';
  }, []);

  const value = {
    user,
    superAdmin,
    hasPermission,
    login,
    registerAdmin,
    loginCandidate,
    loginCandidateWithGoogle,
    loginCandidateWithSupabase,
    loginSuperAdmin,
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
