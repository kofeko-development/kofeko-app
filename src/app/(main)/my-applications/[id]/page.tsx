
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Trash2, ArrowLeft } from "lucide-react";
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
import Link from 'next/link';

export default function ApplicationStatusPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const applicationId = params.id;

    const handleWithdraw = () => {
        toast({
            title: 'Withdraw not available',
            description: 'Application actions will be enabled once real application data is connected.',
            variant: 'destructive',
        });
    }

    return (
        <div className="flex flex-col gap-6">
             <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 w-fit p-0 h-auto">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Applications
             </Button>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Application Details</h1>
                    <p className="text-muted-foreground flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="size-4" /> {applicationId}</span>
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
                            This action cannot be undone. This will permanently withdraw your application.
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
                    <CardDescription>Application tracking will appear here once connected to real data.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                   <ApplicationTimeline currentStatus={'submitted'} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                        <div className="text-muted-foreground">
                          No job description available yet.
                          <div className="mt-2">
                            <Link className="underline" href="/find-jobs">Browse jobs</Link>
                          </div>
                        </div>
                </CardContent>
            </Card>
        </div>
    )
}
