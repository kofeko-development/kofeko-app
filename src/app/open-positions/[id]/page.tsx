
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, MapPin, Loader2, Info } from "lucide-react";
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
}: any) {
    const formatDescription = (text: string) => {
        if (!text) return '';
        // If it looks like plain text (no tags), convert newlines to <p> tags
        if (!/<[a-z][\s\S]*>/i.test(text)) {
            return text.split('\n').filter(line => line.trim() !== '').map(line => `<p>${line.trim()}</p>`).join('');
        }
        return text;
    };

    const cleanDescription = sanitizeHtml(formatDescription(job.requirements || job.description), {
        allowedTags: ['h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'b', 'i', 'br'],
        allowedAttributes: {
            '*': ['class']
        }
    });

    const company = job.tenant?.company;

    return (
        <>
            <main className="flex-1 py-12" style={!user ? { marginTop: '80px' } : {}}>
                <div className="container grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="bg-primary/10 p-4 rounded-xl shrink-0 w-fit">
                                {company?.companyLogo ? (
                                    <img src={company.companyLogo} alt={job.tenant.name} className="size-12 object-contain" />
                                ) : (
                                    <Briefcase className="size-12 text-primary" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold font-headline tracking-tight">{job.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-muted-foreground">
                                    <span className="font-semibold text-foreground">{job.tenant.name}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {job.location || 'Remote'}</span>
                                    {job.employmentType && <span className="flex items-center gap-1.5"><Briefcase className="size-4" /> {job.employmentType}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 border-y py-6">
                            <div className="flex-1 min-w-[140px] space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Size</p>
                                <p className="font-medium">{company?.companySize || '—'}</p>
                            </div>
                            <div className="flex-1 min-w-[140px] space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Industry</p>
                                <p className="font-medium">{company?.industry || '—'}</p>
                            </div>
                            <div className="flex-1 min-w-[140px] space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</p>
                                <p className="font-medium">{job.location || 'Remote'}</p>
                            </div>
                            <div className="flex-1 min-w-[140px] space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Mode</p>
                                <p className="font-medium">{job.department || 'On-site'}</p>
                            </div>
                        </div>

                        <div className="prose prose-stone dark:prose-invert max-w-none">
                            <h2 className="text-2xl font-bold">About the Role</h2>
                            <div dangerouslySetInnerHTML={{ __html: cleanDescription }} className="mt-4 leading-relaxed" />
                        </div>

                        {/* Dynamic Hiring Process Roadmap */}
                        {(() => {
                            const defaultFlowStages = [
                                { stage: 'applied', label: 'Applied', order: 1, enabled: true },
                                { stage: 'screening', label: 'Screening', order: 2, enabled: true },
                                { stage: 'technical_interview', label: 'Technical Interview', order: 3, enabled: true },
                                { stage: 'hr_interview', label: 'HR Interview', order: 4, enabled: true },
                                { stage: 'offer', label: 'Offer', order: 5, enabled: true },
                                { stage: 'hired', label: 'Hired', order: 6, enabled: true },
                                { stage: 'rejected', label: 'Rejected', order: 7, enabled: true },
                            ];
                            const customStages = job.customStages || defaultFlowStages;
                            const activeStages = [...customStages]
                                .sort((a: any, b: any) => a.order - b.order)
                                .filter((s: any) => s.enabled && s.stage !== 'rejected');

                            return (
                                <div className="bg-card rounded-xl p-6 border shadow-sm space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold font-headline">Hiring Process</h3>
                                        <p className="text-sm text-muted-foreground">What to expect throughout our recruitment journey</p>
                                    </div>
                                    
                                    <div className="relative">
                                        {/* Desktop Horizontal Timeline */}
                                        <div className="hidden md:flex items-start justify-between relative">
                                            <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100 -z-10" />
                                            
                                            {activeStages.map((stage: any, index: number) => {
                                                return (
                                                    <div key={stage.stage} className="flex flex-col items-center text-center flex-1 px-2 relative group">
                                                        <div className="size-10 rounded-full bg-primary/10 border-2 border-primary text-primary flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110 duration-200">
                                                            {index + 1}
                                                        </div>
                                                        <p className="mt-3 font-semibold text-sm leading-tight text-slate-800">{stage.label}</p>
                                                        <p className="mt-1 text-[11px] text-muted-foreground capitalize">{stage.stage.replace('_', ' ')}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Mobile Vertical Timeline */}
                                        <div className="flex md:hidden flex-col gap-6 relative pl-6 border-l-2 border-slate-100 ml-4">
                                            {activeStages.map((stage: any, index: number) => {
                                                return (
                                                    <div key={stage.stage} className="relative flex gap-4 items-start">
                                                        <div className="absolute -left-[35px] top-0 size-7 rounded-full bg-primary/10 border-2 border-primary text-primary flex items-center justify-center font-bold text-xs shadow-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-slate-800">{stage.label}</h4>
                                                            <p className="text-[11px] text-muted-foreground capitalize">{stage.stage.replace('_', ' ')}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {company?.shortDescription && (
                            <div className="bg-muted/30 rounded-xl p-6 border">
                                <h3 className="font-bold mb-2">About {job.tenant.name}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{company.shortDescription}</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-lg border-2 border-primary/5">
                            <CardHeader className="bg-muted/10">
                                <CardTitle>Apply for this position</CardTitle>
                                <CardDescription>
                                    {user ? "Your information is pre-filled from your profile." : "Fill out the form below to submit your application."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {!user ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} className="h-11" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                                <Input id="email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="h-11" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{email}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="resume" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resume/CV *</Label>
                                            {user?.resumeUrl && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Attached</span>
                                            )}
                                        </div>
                                        <Input
                                            id="resume"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                            className="file:text-primary file:font-semibold h-11 pt-2"
                                            onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                                            required={!user?.resumeUrl}
                                            disabled={isLoading}
                                        />
                                        {user?.resumeUrl && (
                                            <div className="flex items-center gap-2 mt-2 p-2 bg-muted/50 rounded-lg border border-dashed">
                                                <div className="bg-primary/10 p-1.5 rounded">
                                                    <Briefcase className="size-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-medium truncate">{user.resumeUrl.split('/').pop()}</p>
                                                    <p className="text-[10px] text-muted-foreground">From your profile</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cover-letter" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Letter (Optional)</Label>
                                        <Textarea id="cover-letter" placeholder="Tell us why you're a great fit for this role..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} disabled={isLoading} className="min-h-[120px] resize-none" />
                                    </div>
                                    <Button type="submit" className="w-full h-12 text-base font-semibold shadow-md" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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

        if (!user) {
            toast({
                title: "Login Required",
                description: "Please login as a candidate to apply for this position.",
                variant: "destructive",
            });
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            let finalResumeUrl = user.resumeUrl;
            let finalResumeMimeType = user.resumeMimeType;

            // If a new file is selected, upload it first
            if (resume) {
                const uploadRes = await portalApi.uploadResume(resume);
                finalResumeUrl = uploadRes.resumeUrl;
                finalResumeMimeType = uploadRes.resumeMimeType;
            }

            if (!finalResumeUrl) {
                throw new Error("Please upload a resume to complete your application.");
            }

            await portalApi.apply(job.tenant.slug, job.id, {
                resumeUrl: finalResumeUrl,
                resumeMimeType: finalResumeMimeType,
                coverLetter: coverLetter || undefined,
            });

            toast({
                title: "Application Submitted!",
                description: `You have successfully applied for ${job.title}.`,
            });

            // Small delay before redirecting to show the success toast
            setTimeout(() => {
                router.push('/my-applications');
            }, 1500);

        } catch (error) {
            toast({
                title: "Application Failed",
                description: error instanceof Error ? error.message : "Something went wrong while submitting your application.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
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
