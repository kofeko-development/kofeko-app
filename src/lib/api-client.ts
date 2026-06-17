// src/lib/api-client.ts

// ── Storage keys — one set per user type ─────────────────────────────────────
export const AUTH_TYPE_KEY        = 'kofeko_auth_type';          // 'staff' | 'candidate' | 'super_admin'
export const SESSION_EXPIRED_EVENT = 'kofeko:session-expired';
export const STAFF_TOKEN_KEY      = 'kofeko_staff_token';
export const STAFF_REFRESH_KEY    = 'kofeko_staff_refresh';
export const CANDIDATE_TOKEN_KEY  = 'kofeko_candidate_token';
export const CANDIDATE_REFRESH_KEY= 'kofeko_candidate_refresh';
export const SUPERADMIN_TOKEN_KEY = 'kofeko_superadmin_token';
export const SUPERADMIN_REFRESH_KEY='kofeko_superadmin_refresh';

// Legacy keys — kept for migration (remove after one release cycle)
export const LEGACY_ACCESS_KEY  = 'kofeko_access_token';
export const LEGACY_REFRESH_KEY = 'kofeko_refresh_token';

export type AuthType = 'staff' | 'candidate' | 'super_admin' | null;

// ── Read helpers ──────────────────────────────────────────────────────────────
const ls = (key: string): string | null =>
  typeof window === 'undefined' ? null : localStorage.getItem(key);

export const getAuthType = (): AuthType => ls(AUTH_TYPE_KEY) as AuthType;

export const getAccessToken = (type?: AuthType): string | null => {
  const t = type ?? getAuthType();
  if (t === 'candidate') return ls(CANDIDATE_TOKEN_KEY);
  if (t === 'super_admin') return ls(SUPERADMIN_TOKEN_KEY);
  return ls(STAFF_TOKEN_KEY) ?? ls(LEGACY_ACCESS_KEY); // fallback for migration
};

export const getRefreshToken = (type?: AuthType): string | null => {
  const t = type ?? getAuthType();
  if (t === 'candidate') return ls(CANDIDATE_REFRESH_KEY);
  if (t === 'super_admin') return ls(SUPERADMIN_REFRESH_KEY);
  return ls(STAFF_REFRESH_KEY) ?? ls(LEGACY_REFRESH_KEY); // fallback for migration
};

// ── Write helpers ─────────────────────────────────────────────────────────────
export const setTokens = (
  type: 'staff' | 'candidate' | 'super_admin',
  accessToken: string,
  refreshToken: string
) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TYPE_KEY, type);
  if (type === 'candidate') {
    localStorage.setItem(CANDIDATE_TOKEN_KEY, accessToken);
    localStorage.setItem(CANDIDATE_REFRESH_KEY, refreshToken);
  } else if (type === 'super_admin') {
    localStorage.setItem(SUPERADMIN_TOKEN_KEY, accessToken);
    localStorage.setItem(SUPERADMIN_REFRESH_KEY, refreshToken);
  } else {
    localStorage.setItem(STAFF_TOKEN_KEY, accessToken);
    localStorage.setItem(STAFF_REFRESH_KEY, refreshToken);
    // Clean up legacy keys
    localStorage.removeItem(LEGACY_ACCESS_KEY);
    localStorage.removeItem(LEGACY_REFRESH_KEY);
  }
};

export const setAccessToken = (type: AuthType, token: string) => {
  if (typeof window === 'undefined') return;
  if (type === 'candidate') localStorage.setItem(CANDIDATE_TOKEN_KEY, token);
  else if (type === 'super_admin') localStorage.setItem(SUPERADMIN_TOKEN_KEY, token);
  else localStorage.setItem(STAFF_TOKEN_KEY, token);
};

// ── Clear helpers ─────────────────────────────────────────────────────────────
export const clearTokens = (type?: AuthType) => {
  if (typeof window === 'undefined') return;
  const t = type ?? getAuthType();
  if (t === 'candidate') {
    localStorage.removeItem(CANDIDATE_TOKEN_KEY);
    localStorage.removeItem(CANDIDATE_REFRESH_KEY);
  } else if (t === 'super_admin') {
    localStorage.removeItem(SUPERADMIN_TOKEN_KEY);
    localStorage.removeItem(SUPERADMIN_REFRESH_KEY);
  } else {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    localStorage.removeItem(STAFF_REFRESH_KEY);
    localStorage.removeItem(LEGACY_ACCESS_KEY);
    localStorage.removeItem(LEGACY_REFRESH_KEY);
  }
  localStorage.removeItem(AUTH_TYPE_KEY);
};

// Alias for backward compatibility — clears current active session
export const clearAuthStorage = () => clearTokens();

// ── API base URL ──────────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';

// ── Error details (Zod flatten from backend validation) ─────────────────────
export type ApiErrorDetails = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
  [key: string]: unknown;
};

// ── Error class ───────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  errorCode?: string;
  details?: ApiErrorDetails;

  constructor(message: string, status: number, errorCode?: string, details?: ApiErrorDetails) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

// ── Envelope type ─────────────────────────────────────────────────────────────
type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

// ── Token refresh ─────────────────────────────────────────────────────────────
async function refreshAccessToken(type: AuthType): Promise<boolean> {
  const refreshToken = getRefreshToken(type);
  if (!refreshToken) return false;

  // Staff and candidates both use /auth/refresh
  // Super admin uses /superadmin/auth/refresh
  const refreshPath =
    type === 'super_admin'
      ? `${API_BASE_URL}/superadmin/auth/refresh`
      : `${API_BASE_URL}/auth/refresh`;

  try {
    const response = await fetch(refreshPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const payload = (await response.json()) as ApiEnvelope<{ accessToken: string }>;
    if (!payload.data?.accessToken) return false;

    setAccessToken(type, payload.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// ── Error parser ──────────────────────────────────────────────────────────────
async function parseError(response: Response): Promise<ApiError> {
  const status = response.status;
  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    return new ApiError('Request failed', status);
  }

  if (!bodyText.trim()) {
    return new ApiError('Request failed', status);
  }

  try {
    const payload = JSON.parse(bodyText) as Partial<ApiEnvelope<unknown>> & {
      errorCode?: string;
      details?: ApiErrorDetails;
    };
    return new ApiError(
      payload.message ?? 'Request failed',
      status,
      payload.errorCode,
      payload.details,
    );
  } catch {
    return new ApiError(bodyText.length > 200 ? `${bodyText.slice(0, 200)}…` : bodyText, status);
  }
}

// ── Request options ───────────────────────────────────────────────────────────
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  authType?: AuthType;           // which token to use — defaults to current active type
  retryOnUnauthorized?: boolean;
};

// ── Main request function ─────────────────────────────────────────────────────
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, retryOnUnauthorized = true } = options;
  const tokenType = options.authType ?? getAuthType();
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken(tokenType);
    if (!token) {
      throw new ApiError(
        'Your session has expired. Please log in again.',
        401,
        'UNAUTHORIZED',
      );
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (response.status === 401 && auth && retryOnUnauthorized && tokenType) {
    const refreshed = await refreshAccessToken(tokenType);
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
    clearTokens(tokenType);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      window.dispatchEvent(new StorageEvent('storage', {
        key: AUTH_TYPE_KEY,
        newValue: null,
      }));
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}
