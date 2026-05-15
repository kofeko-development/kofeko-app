
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, Linkedin, FileText, CalendarPlus, Loader2, ArrowLeft } from "lucide-react";
import { candidatesApi, ApiCandidate } from '@/lib/stage1-2-api';
import { useToast } from '@/hooks/use-toast';

export default function ApplicantProfilePage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as string;

    const [candidate, setCandidate] = useState<ApiCandidate | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCandidate = async () => {
            setIsLoading(true);
            try {
                const data = await candidatesApi.get(id);
                setCandidate(data);
            } catch (error) {
                toast({
                    title: 'Failed to load candidate',
                    description: error instanceof Error ? error.message : 'Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        void loadCandidate();
    }, [id, toast]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!candidate) {
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

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarFallback className="font-medium">
                                    {getInitials(candidate.firstName, candidate.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold font-headline">{candidate.firstName} {candidate.lastName}</h2>
                            <p className="text-muted-foreground">Candidate Profile</p>
                            <Button className="mt-4 w-full">
                                <CalendarPlus className="mr-2 h-4 w-4"/>
                                Schedule Interview
                            </Button>
                        </CardContent>
                        <CardContent className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Contact Information</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 hover:text-primary">
                                    <Mail className="h-4 w-4" /> <span>{candidate.email}</span>
                                </a>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> <span>{candidate.phoneNumber || 'N/A'}</span>
                                </div>
                                <a 
                                    href={candidate.linkedinUrl ? (candidate.linkedinUrl.startsWith('http') ? candidate.linkedinUrl : `https://${candidate.linkedinUrl}`) : '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 hover:text-primary"
                                >
                                    <Linkedin className="h-4 w-4" /> <span>{candidate.linkedinUrl || 'N/A'}</span>
                                </a>
                            </div>
                        </CardContent>
                        <CardContent className="border-t pt-4">
                            {candidate.resumeUrl ? (
                                <Button asChild variant="outline" className="w-full">
                                    <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                                        <FileText className="mr-2 h-4 w-4" /> Download Resume
                                    </a>
                                </Button>
                            ) : (
                                <Button variant="outline" className="w-full" disabled>
                                    <FileText className="mr-2 h-4 w-4" /> No Resume Attached
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p>{candidate.skills?.length ? `Skills: ${candidate.skills.join(', ')}` : 'No specific skills listed.'}</p>
                                <p className="mt-4">{candidate.location ? `Location: ${candidate.location}` : ''}</p>
                                <p>{candidate.yearsOfExperience ? `Experience: ${candidate.yearsOfExperience} years` : ''}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
