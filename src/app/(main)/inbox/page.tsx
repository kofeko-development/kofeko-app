'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import InboxPageContent from './inbox-content';

export default function InboxPage() {
  const { user, loading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;

    if (user.role !== 'candidate') {
      router.replace(hasPermission('rbac:manage') ? '/admin/dashboard' : '/dashboard');
    }
  }, [loading, user, hasPermission, router]);

  if (loading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role !== 'candidate') {
    return null;
  }

  return <InboxPageContent />;
}
