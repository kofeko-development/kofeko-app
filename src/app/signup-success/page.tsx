'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle } from "lucide-react";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status');

    if (status === 'pending') {
        return (
            <Card className="max-w-md w-full border-amber-200/50 shadow-md">
                <CardHeader className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-amber-500 mb-4 animate-pulse" />
                    <CardTitle className="text-2xl font-bold">Approval Pending</CardTitle>
                    <CardDescription>
                        Your company registration is awaiting verification.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        Thank you for registering. Our team is actively reviewing your company details. This process usually takes less than 24 hours. We will email you once approved.
                    </p>
                    <Button onClick={() => router.push('/')} className="w-full bg-amber-600 hover:bg-amber-700">
                        Return to Home
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (status === 'rejected') {
        return (
            <Card className="max-w-md w-full border-rose-200/50 shadow-md">
                <CardHeader className="text-center">
                    <XCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
                    <CardTitle className="text-2xl font-bold">Registration Not Approved</CardTitle>
                    <CardDescription className="text-rose-600/80 font-medium">
                        We could not verify your company registration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        Unfortunately, your registration request could not be approved at this time. Please contact <span className="font-semibold text-foreground">support@kofeko.ai</span> for further details or to appeal.
                    </p>
                    <Button onClick={() => router.push('/')} className="w-full" variant="outline">
                        Return to Home
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-md w-full border-emerald-200/50 shadow-md">
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                <CardTitle className="text-2xl font-bold">Registration Received!</CardTitle>
                <CardDescription>
                    Thank you for registering your company with Kofeko.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    We will process your request, which usually takes around 24 hours. After verification, we will notify you through your registered email ID.
                </p>
                <Button onClick={() => router.push('/')} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Return to Home
                </Button>
            </CardContent>
        </Card>
    );
}

export default function SignupSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
