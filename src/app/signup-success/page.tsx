
'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
    const router = useRouter();

    return (
        <Card className="max-w-md w-full">
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <CardTitle className="text-2xl font-bold">Registration Received!</CardTitle>
                <CardDescription>
                    Thank you for registering your company with Kofeko.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                    We will process your request, which usually takes around 24 hours. After verification, we will notify you through your registered email ID.
                </p>
                <Button onClick={() => router.push('/')} className="w-full">
                    Return to Home
                </Button>
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
