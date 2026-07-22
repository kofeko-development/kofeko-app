'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import CompanyProfilePage from '@/components/company-profile-page';

export default function StaffCompanyProfileRoute() {
  const { user, loading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (hasPermission('rbac:manage')) {
      router.replace('/admin/company-profile');
    }
  }, [loading, user, hasPermission, router]);

  if (loading || !user || hasPermission('rbac:manage')) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <CompanyProfilePage />;
}
