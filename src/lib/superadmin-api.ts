import { apiRequest } from '@/lib/api-client';

export type SuperAdminLoginResult =
  | {
      requiresTwoFactor: true;
      pendingToken: string;
      superAdmin: { id: string; email: string; firstName: string; lastName: string };
    }
  | {
      requiresTwoFactor?: false;
      accessToken: string;
      refreshToken: string;
      superAdmin: { id: string; email: string; firstName: string; lastName: string };
    };

export const superadminApi = {
  login: (email: string, password: string) =>
    apiRequest<SuperAdminLoginResult>('/superadmin/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  verifyLogin2FA: (pendingToken: string, code: string) =>
    apiRequest<{
      accessToken: string;
      refreshToken: string;
      superAdmin: { id: string; email: string; firstName: string; lastName: string };
    }>('/superadmin/auth/login/2fa-verify', {
      method: 'POST',
      body: { pendingToken, code },
    }),

  forgotPassword: (email: string) =>
    apiRequest<void>('/superadmin/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest<void>('/superadmin/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),

  get2FAStatus: () =>
    apiRequest<{ enabled: boolean }>('/superadmin/2fa/status', { auth: true, authType: 'super_admin' }),

  setup2FA: () =>
    apiRequest<{ otpauthUrl: string; qrDataUrl: string }>('/superadmin/2fa/setup', {
      method: 'POST',
      auth: true,
      authType: 'super_admin',
    }),

  verify2FA: (code: string) =>
    apiRequest<{ backupCodes: string[] }>('/superadmin/2fa/verify', {
      method: 'POST',
      body: { code },
      auth: true,
      authType: 'super_admin',
    }),

  disable2FA: (code: string) =>
    apiRequest<void>('/superadmin/2fa/disable', {
      method: 'POST',
      body: { code },
      auth: true,
      authType: 'super_admin',
    }),
};
