'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { InboxListSkeleton } from '@/components/loading/inbox-list-skeleton';
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
    return <InboxListSkeleton />;
  }

  if (user.role !== 'candidate') {
    return null;
  }

  return <InboxPageContent />;
}
