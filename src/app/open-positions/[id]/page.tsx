
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, MapPin, Loader2 } from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import sanitizeHtml from 'sanitize-html';
import AppFooter from '@/components/app-footer';
import MainLayout from '@/app/(main)/layout';
import { portalApi, type PortalJobDetail } from '@/lib/portal-api';

function PageContent({ 
  job, 
  user,
  handleSubmit,
  name,
  setName,
  email,
  setEmail,
  coverLetter,
  setCoverLetter,
  setResume,
  isLoading
} : any) {
  const cleanDescription = sanitizeHtml(job.fullDescription || job.description, {
      allowedTags: [ 'h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'b', 'i' ],
      allowedAttributes: {
        '*': [ 'class' ]
      }
  });

  return (
    <>
        <main className="flex-1 py-12" style={!user ? {marginTop: '80px'} : {}}>
            <div className="container grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <Briefcase className="size-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-headline">{job.title}</h1>
                            <p className="text-muted-foreground flex items-center gap-4 mt-1">
                                <span>{job.company}</span>
                                <span className="flex items-center gap-1"><MapPin className="size-4" /> {job.location}</span>
                            </p>
                        </div>
                    </div>
                    <div className="prose prose-stone dark:prose-invert max-w-none mt-8" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
                </div>

                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apply for this position</CardTitle>
                            <CardDescription>{user ? "Your information is pre-filled." : "Fill out the form below to submit your application."}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading || !!user} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || !!user} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="resume">Resume/CV</Label>
                                    <Input id="resume" type="file" className="file:text-primary file:font-semibold" onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)} required disabled={isLoading} />
                                     {user?.resumeUrl && (
                                        <p className="text-xs text-muted-foreground">Current resume: {user.resumeUrl}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                                    <Textarea id="cover-letter" placeholder="Tell us why you're a great fit for this role..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} disabled={isLoading} />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
         {!user && <AppFooter />}
    </>
  );
}


export default function JobApplicationPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const id = params.id as string;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [resume, setResume] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setCoverLetter(user.coverLetter || '');
        }
    }, [user]);

    const [job, setJob] = useState<PortalJobDetail | null>(null);
    const [jobLoading, setJobLoading] = useState(true);

    useEffect(() => {
        setJobLoading(true);
        portalApi
            .getJob(id)
            .then((res) => setJob(res))
            .catch((err) => {
                toast({
                    title: 'Job not found',
                    description: err instanceof Error ? err.message : 'Please go back and try again.',
                    variant: 'destructive',
                });
                setJob(null);
            })
            .finally(() => setJobLoading(false));
    }, [id, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: 'Apply coming soon',
            description: 'Job applications will be enabled once the portal apply API is wired into this UI.',
        });
    };
    
    if (jobLoading) {
         return (
             <div className="flex h-screen w-screen items-center justify-center">
                 <div className="text-center text-muted-foreground">Loading job...</div>
             </div>
         );
    }

    if (!job) {
         return (
             <div className="flex h-screen w-screen items-center justify-center">
                 <div className="text-center">
                    <h1 className="text-2xl font-bold">Job Not Found</h1>
                    <p className="text-muted-foreground">The job posting you are looking for could not be found.</p>
                    <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
                 </div>
             </div>
         );
    }

    const pageProps = {
        job,
        user,
        handleSubmit,
        name,
        setName,
        email,
        setEmail,
        coverLetter,
        setCoverLetter,
        setResume,
        isLoading: isLoading || jobLoading,
    };
    

    if (user) {
        return (
            <MainLayout>
                <PageContent {...pageProps} />
            </MainLayout>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <PublicNavbar />
            <PageContent {...pageProps} />
        </div>
    )
}
