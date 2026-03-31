
'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, Linkedin, FileText, CalendarPlus } from "lucide-react";
import { applicantsData } from '@/lib/data';
import { jobs } from '@/lib/jobs-data';


export default function ApplicantProfilePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const applicant = useMemo(() => applicantsData.find(a => a.id === id), [id]);
    
    // For now, we'll just associate every applicant with the first job for demo purposes.
    const job = jobs[0];

    if (!applicant) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold">Applicant not found</p>
                    <p className="text-muted-foreground">The applicant you are looking for does not exist.</p>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </div>
        );
    }

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
        }
        return names[0].charAt(0);
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="font-medium">{getInitials(applicant.name)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold font-headline">{applicant.name}</h2>
                <p className="text-muted-foreground">Applying for {job.title}</p>
                <Button className="mt-4 w-full">
                    <CalendarPlus className="mr-2 h-4 w-4"/>
                    Schedule Interview
                </Button>
            </CardContent>
            <CardContent className="border-t pt-4">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                <a href={`mailto:${applicant.email}`} className="flex items-center gap-2 hover:text-primary">
                    <Mail className="h-4 w-4" /> <span>{applicant.email}</span>
                </a>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> <span>{applicant.phone || 'N/A'}</span>
                </div>
                <a href={applicant.linkedin ? `https://${applicant.linkedin}` : '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                    <Linkedin className="h-4 w-4" /> <span>{applicant.linkedin || 'N/A'}</span>
                </a>
                </div>
            </CardContent>
            <CardContent className="border-t pt-4">
                <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> Download Resume
                </Button>
            </CardContent>
            </Card>
            
        </div>
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p>{applicant.resumeText}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
        </div>
    );
}
