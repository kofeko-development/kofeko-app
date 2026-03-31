
'use client';
import { allUsers } from '@/lib/admin-data';
import UserTable from '../users/_components/user-table';

export default function CandidatesPage() {
    const candidateUsers = allUsers.filter(u => u.role === 'candidate');
    
    return (
       <UserTable 
        users={candidateUsers}
        title="Candidate Management"
        description="View and manage all candidate profiles on the platform."
       />
    );
}
