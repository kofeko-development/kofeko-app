import type { Metadata } from 'next';

import { AuthPortalShell } from '@/components/auth/AuthPortalShell';

export const metadata: Metadata = {
  title: {
    template: '%s | Kofeko',
    default: 'Sign in',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPortalLayout({ children }: { children: React.ReactNode }) {
  return <AuthPortalShell>{children}</AuthPortalShell>;
}
