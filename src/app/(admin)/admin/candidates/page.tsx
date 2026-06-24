
'use client';
import { useEffect, useMemo } from 'react';
import UserTable from '../users/_components/user-table';
import { mapCandidateToDisplayUser } from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { useCandidatesList } from '@/hooks/use-candidates';

export default function CandidatesPage() {
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const {
        data,
        isLoading: loading,
        isError,
        error,
    } = useCandidatesList({ page: 1, limit: 100 }, { enabled: !authLoading && !!user });

    const users = useMemo(
        () => (data?.items ?? []).map(mapCandidateToDisplayUser),
        [data],
    );

    useEffect(() => {
        if (!isError) return;
        toast({
            title: 'Could not load candidates',
            description: error instanceof Error ? error.message : 'Try again later.',
            variant: 'destructive',
        });
    }, [isError, error, toast]);

    return (
       <UserTable
        users={users}
        loading={loading}
        title="Candidate Management"
        description="View and manage candidates who have applied to your job postings."
        allowStatusActions={false}
       />
    );
}
