import type { User } from './types';

const USER_CACHE_KEY = 'kofeko_user_cache';
const SUPERADMIN_CACHE_KEY = 'kofeko_superadmin_cache';

export type CachedSuperAdmin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export function readCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function writeCachedUser(user: User): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
}

export function clearCachedUser(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(USER_CACHE_KEY);
}

export function readCachedSuperAdmin(): CachedSuperAdmin | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SUPERADMIN_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedSuperAdmin;
  } catch {
    return null;
  }
}

export function writeCachedSuperAdmin(admin: CachedSuperAdmin): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SUPERADMIN_CACHE_KEY, JSON.stringify(admin));
}

export function clearCachedSuperAdmin(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SUPERADMIN_CACHE_KEY);
}

export function clearAllSessionCaches(): void {
  clearCachedUser();
  clearCachedSuperAdmin();
}
