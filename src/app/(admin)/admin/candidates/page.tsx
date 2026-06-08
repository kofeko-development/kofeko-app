
'use client';
import { useCallback, useEffect, useState } from 'react';
import UserTable from '../users/_components/user-table';
import { listCandidates, mapCandidateToDisplayUser } from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

export default function CandidatesPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listCandidates(1, 100);
            setUsers(res.items.map(mapCandidateToDisplayUser));
        } catch (e) {
            setUsers([]);
            toast({
                title: 'Could not load candidates',
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
       <UserTable
        users={users}
        loading={loading}
        title="Candidate Management"
        description="View and manage candidates who have applied to your job postings."
        allowStatusActions={false}
       />
    );
}
