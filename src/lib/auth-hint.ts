const AUTH_HINT_COOKIE = 'kofeko_auth_hint';

export type AuthRouteHint = 'admin' | 'staff' | 'candidate' | 'super_admin';

export function setAuthRouteHint(hint: AuthRouteHint): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_HINT_COOKIE}=${hint}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthRouteHint(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_HINT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function resolveAuthRouteHint(
  permissions: string[] = [],
  roles: string[] = [],
): AuthRouteHint {
  if (roles.includes('candidate')) return 'candidate';
  if (permissions.includes('rbac:manage')) return 'admin';
  return 'staff';
}
