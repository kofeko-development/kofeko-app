'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import UserTable from '../users/_components/user-table';
import { listStaffUsers, mapStaffUserToDisplay, isRecruiterManagementUser } from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function RecruitersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listStaffUsers(1, 100);
      setUsers(res.items.map(mapStaffUserToDisplay).filter(isRecruiterManagementUser));
    } catch (e) {
      setUsers([]);
      toast({
        title: 'Could not load staff',
        description: e instanceof Error ? e.message : 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <UserTable
        users={users}
        loading={loading}
        title="Recruiter Management"
        description="Track invited recruiters and team members. Pending means they have not accepted the invite yet."
        allowStatusActions
        onStaffStatusUpdated={() => void load()}
        headerAction={
          <Button type="button" variant="default" className="btn-glass shadow-md" asChild>
            <Link href="/admin/recruiters/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add recruiter
            </Link>
          </Button>
        }
      />
    </div>
  );
}
