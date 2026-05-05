"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from './types';

type LoginInput = {
  tenantSlug: string;
  email: string;
  password: string;
};

type RegisterAdminInput = {
  tenantName: string;
  tenantSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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

type BackendUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  permissions?: string[];
  roles?: string[];
  status?: 'active' | 'invited' | 'suspended';
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

interface AuthContextType {
  user: User | null;
  hasPermission: (permission: string) => boolean;
  login: (input: LoginInput) => Promise<User>;
  registerAdmin: (input: RegisterAdminInput) => Promise<User>;
  loginCandidate: (input: LoginCandidateInput) => Promise<User>;
  registerCandidate: (input: RegisterCandidateInput) => Promise<User>;
  updateCurrentUser: (nextUser: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ACCESS_TOKEN_KEY = 'kofeko_access_token';
const REFRESH_TOKEN_KEY = 'kofeko_refresh_token';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';

const getErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    return payload?.message ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
};

const mapBackendUser = (backendUser: BackendUser): User => {
  const fullName = `${backendUser.firstName ?? ''} ${backendUser.lastName ?? ''}`.trim();
  const permissions = backendUser.permissions ?? [];
  const isOperator = permissions.includes('rbac:manage');
  const isCandidate = !isOperator && permissions.includes('candidate:read') && !permissions.includes('job:create');
  const role: User['role'] = isOperator ? 'operator' : isCandidate ? 'candidate' : 'recruiter';

  return {
    uid: backendUser.id,
    email: backendUser.email,
    name: fullName || backendUser.email,
    role,
    permissions,
    backendRoles: backendUser.roles ?? [],
    status: backendUser.status === 'invited' ? 'pending' : backendUser.status,
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

        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (meResponse.ok) {
          const payload = (await meResponse.json()) as ApiEnvelope<BackendUser>;
          setUser(mapBackendUser(payload.data));
          return;
        }

        if (meResponse.status === 401) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            clearSession();
            return;
          }

          const refreshedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
          if (!refreshedToken) {
            clearSession();
            return;
          }

          const retryResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${refreshedToken}`,
            },
          });

          if (retryResponse.ok) {
            const payload = (await retryResponse.json()) as ApiEnvelope<BackendUser>;
            setUser(mapBackendUser(payload.data));
            return;
          }
        }

        clearSession();
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
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const payload = (await response.json()) as ApiEnvelope<{ accessToken: string }>;
      localStorage.setItem(ACCESS_TOKEN_KEY, payload.data.accessToken);
      return true;
    } catch (error) {
      console.error('Failed to refresh access token', error);
      return false;
    }
  };

  const login = async (input: LoginInput) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const payload = (await response.json()) as ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>;

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);

    const mappedUser = mapBackendUser(payload.data.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const registerAdmin = async (input: RegisterAdminInput) => {
    const response = await fetch(`${API_BASE_URL}/auth/register-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const payload = (await response.json()) as ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>;

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);

    const mappedUser = mapBackendUser(payload.data.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const registerCandidate = async (input: RegisterCandidateInput) => {
    const response = await fetch(`${API_BASE_URL}/auth/register-candidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const payload = (await response.json()) as ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>;

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);
    const mappedUser = mapBackendUser(payload.data.user);
    setUser(mappedUser);
    return mappedUser;
  };

  const loginCandidate = async (input: LoginCandidateInput) => {
    const response = await fetch(`${API_BASE_URL}/auth/login-candidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const payload = (await response.json()) as ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
      user: BackendUser;
    }>;

    localStorage.setItem(ACCESS_TOKEN_KEY, payload.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);
    const mappedUser = mapBackendUser(payload.data.user);
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
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Logout request failed', error);
      }
    }

    clearSession();
    window.location.href = '/login';
  };

  const value = { user, hasPermission, login, registerAdmin, loginCandidate, registerCandidate, updateCurrentUser, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
