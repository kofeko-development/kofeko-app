'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Trash2, ArrowLeft, Loader2, Briefcase } from "lucide-react";
import ApplicationTimeline from './_components/application-timeline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useApplicationDetail } from '@/hooks/use-portal';


export default function ApplicationStatusPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const applicationId = params.id as string;

    const {
        data,
        isLoading,
        isError,
        error,
    } = useApplicationDetail(applicationId);

    const application = data?.application ?? null;
    const job = data?.job ?? null;

    useEffect(() => {
        if (!isError) return;
        toast({
            title: 'Failed to load details',
            description: error instanceof Error ? error.message : 'Please check your connection and try again.',
            variant: 'destructive',
        });
    }, [isError, error, toast]);

    const handleWithdraw = () => {
        toast({
            title: 'Withdraw Request Sent',
            description: 'Your request to withdraw this application has been sent to the hiring team.',
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-lg font-semibold text-muted-foreground">Application not found</p>
                <Button className="mt-4" onClick={() => router.push('/my-applications')}>
                    Back to My Applications
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
             <Button variant="ghost" size="sm" onClick={() => router.push('/my-applications')} className="mb-2 w-fit p-0 h-auto hover:bg-transparent hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Applications
             </Button>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{job?.title || application.job?.title}</h1>
                    <p className="text-muted-foreground flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5"><Briefcase className="size-4" /> {job?.tenant?.name || application.job?.companyName || 'Company'}</span>
                        {job?.location && <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {job.location}</span>}
                    </p>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4"/> Withdraw Application
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will request the hiring team to withdraw your application. This cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleWithdraw}>Yes, Withdraw</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>Track the interview stage of your application in real-time.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                   <ApplicationTimeline currentStage={application.stage} customStages={application.job?.customStages} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                        <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                            {job?.description || 'No job description available yet.'}
                        </div>
                </CardContent>
            </Card>
        </div>
    );
}
