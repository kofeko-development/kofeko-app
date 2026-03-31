
'use client';
import { allUsers } from '@/lib/admin-data';
import UserTable from '../users/_components/user-table';

export default function RecruitersPage() {
    const recruiterUsers = allUsers.filter(u => u.role === 'recruiter');
    
    return (
       <UserTable 
        users={recruiterUsers}
        title="Recruiter Management"
        description="View, manage, and grant access to recruiter accounts."
       />
    );
}
