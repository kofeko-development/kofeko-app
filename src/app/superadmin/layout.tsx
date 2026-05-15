'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getAuthType } from '@/lib/api-client';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { superAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const authType = getAuthType();
    if (authType !== 'super_admin' || !superAdmin) {
      router.push('/superadmin/login');
    }
  }, [superAdmin, loading, router]);

  if (loading || !superAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
