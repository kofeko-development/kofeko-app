
'use client';

import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const name = searchParams.get('name');
    const email = searchParams.get('email');

    const handleCreateProfile = () => {
        const query = new URLSearchParams({
            name: name || '',
            email: email || ''
        }).toString();
        router.push(`/signup?${query}`);
    }

    return (
        <Card className="max-w-md w-full">
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <CardTitle className="text-2xl font-bold">Application Received!</CardTitle>
                <CardDescription>
                    Thank you for your interest. Your application has been submitted successfully.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                    To track your application status and apply for other jobs faster, create a free profile.
                </p>
                <Button onClick={handleCreateProfile} className="w-full">
                    Create My Profile
                </Button>
                <div className="mt-4 text-sm">
                    <Link href="/open-positions" className="text-muted-foreground hover:text-primary underline">
                        Or continue browsing jobs
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SignupSuccessPage() {
    return (
        // Suspense is required to use useSearchParams
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
