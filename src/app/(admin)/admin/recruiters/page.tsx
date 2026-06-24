'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import UserTable from '../users/_components/user-table';
import { mapStaffUserToDisplay, isRecruiterManagementUser } from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { useInvalidateTeam, useTeamList } from '@/hooks/use-team';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function RecruitersPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const invalidateTeam = useInvalidateTeam();
  const {
    data,
    isLoading: loading,
    isError,
    error,
  } = useTeamList({ page: 1, limit: 100 }, { enabled: !authLoading && !!user });

  const users = useMemo(
    () => (data?.items ?? []).map(mapStaffUserToDisplay).filter(isRecruiterManagementUser),
    [data],
  );

  useEffect(() => {
    if (!isError) return;
    toast({
      title: 'Could not load staff',
      description: error instanceof Error ? error.message : 'Try again later.',
      variant: 'destructive',
    });
  }, [isError, error, toast]);

  return (
    <div className="flex flex-col gap-6">
      <UserTable
        users={users}
        loading={loading}
        title="Recruiter Management"
        description="Track invited recruiters and team members. Pending means they have not accepted the invite yet."
        allowStatusActions
        onStaffStatusUpdated={() => void invalidateTeam()}
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
