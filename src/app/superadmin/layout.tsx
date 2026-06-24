'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getAuthType } from '@/lib/api-client';
import { PageContentSkeleton } from '@/components/loading/page-content-skeleton';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { superAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const authType = getAuthType();
    const isLoginPage = pathname === '/superadmin/login';

    if (!isLoginPage && (authType !== 'super_admin' || !superAdmin)) {
      router.push('/superadmin/login');
    }
    
    if (isLoginPage && authType === 'super_admin' && superAdmin) {
      router.push('/superadmin/dashboard');
    }
  }, [superAdmin, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 p-6">
        <PageContentSkeleton />
      </div>
    );
  }

  // Allow login page to render even if !superAdmin
  if (!superAdmin && pathname !== '/superadmin/login') {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
