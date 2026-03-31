
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now simply redirects to the more specific recruiters page.
export default function UserManagementPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/recruiters');
    }, [router]);
    
    return (
        <div className="flex h-full items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
}
