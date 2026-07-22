
'use client';
import { useEffect, useMemo } from 'react';
import UserTable from '../users/_components/user-table';
import { mapCandidateToDisplayUser } from '@/lib/admin-api';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';

import { useAuth } from '@/lib/auth';
import { useCandidatesList } from '@/hooks/use-candidates';

export default function CandidatesPage() {
    const { showError } = useApiErrorToast();
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
        showError(error);
    }, [isError, error, showError]);

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
