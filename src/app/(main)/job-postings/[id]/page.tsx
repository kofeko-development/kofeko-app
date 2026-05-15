
'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown, ChevronUp, Search, ArrowLeft, Share2, Linkedin, Loader2, FileEdit, Trash2, Mail, Phone, FileText, CalendarPlus, Sparkles, CheckCircle, AlertTriangle, MessageSquareQuote, TrendingUp, ShieldAlert, Briefcase, MessagesSquare, RefreshCw, Users, BrainCircuit } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { Applicant } from '@/lib/data';
import { interviewsData } from '@/lib/interviews-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { jobsApi, pipelinesApi, evaluationsApi, ApiPipeline, CreatedJob } from '@/lib/stage1-2-api';

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
    }
    return names[0].charAt(0);
}

const hiringStages = ['applied', 'screening', 'technical_interview', 'hr_interview', 'offer', 'hired', 'rejected'];

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    applied: 'secondary',
    screening: 'default',
    technical_interview: 'default',
    hr_interview: 'default',
    offer: 'default',
    rejected: 'destructive',
    hired: 'default'
};

const statusClassMap: { [key: string]: string } = {
    applied: 'bg-yellow-500/20 text-yellow-700',
    screening: 'bg-blue-500/20 text-blue-700',
    technical_interview: 'bg-purple-500/20 text-purple-700',
    hr_interview: 'bg-indigo-500/20 text-indigo-700',
    offer: 'bg-cyan-500/20 text-cyan-700',
    rejected: 'bg-red-500/20 text-red-700',
    hired: 'bg-green-500/20 text-green-700',
};

function mapPipelineToApplicant(p: ApiPipeline): Applicant {
    const evaluation = p.evaluation || (p.evaluations && p.evaluations[0]);
    const rawHi = evaluation?.hiringIntelligence;
    const hi = typeof rawHi === 'string' ? JSON.parse(rawHi) : rawHi;

    return {
        id: p.id,
        candidateId: p.candidateId,
        name: `${p.candidate.firstName} ${p.candidate.lastName}`,
        email: p.candidate.email,
        status: p.stage as any,
        appliedAt: p.createdAt,
        matchScore: evaluation?.score ?? 0,
        summary: hi?.applicationSummary || evaluation?.whyCard || evaluation?.summary || p.decisionNote || 'No summary available.',
        phone: p.candidate.phoneNumber || undefined,
        linkedin: p.candidate.linkedinUrl || undefined,
        resumeUrl: p.candidate.resumeUrl || undefined,
        keySkills: (hi?.keySkills || (evaluation?.skillMatches as any[]) 
            ? (evaluation?.skillMatches as any[])?.filter((s: any) => s.matched).map((s: any) => s.skill)
            : p.candidate.skills) || [],
        experienceSummary: hi?.experienceSummary?.narrative || evaluation?.roleFitNotes || undefined,
        trajectorySummary: hi?.careerTrajectory?.explanation || evaluation?.rankingSummary || undefined,
        riskFlags: hi?.riskFlags?.join(', ') || undefined,
        interviewQuestions: hi?.suggestedInterviewQuestions || undefined,
        relevanceScore: hi?.relevanceToRole?.matchScorePercent || undefined,
        skillScore: hi?.skillsAnalysis?.matchScorePercent || undefined,
        experienceScore: hi?.experienceSummary?.matchScorePercent || undefined,
        trajectoryClassification: hi?.careerTrajectory?.classification || undefined,
    };
}

const ALL_SUGGESTED_QUESTIONS = [
    "Can you walk us through a complex project you've worked on? What was your specific role and contribution?",
    "Your resume highlights experience in a specific skill. How do you see that applying to the challenges of this role?",
    "This role requires a certain attribute. Can you provide an example of a time you demonstrated that quality?",
    "Describe a time you faced a significant setback or failure in a project. How did you handle it, and what did you learn?",
    "How do you stay current with the latest trends and technologies in your field?",
    "What kind of team environment do you thrive in and why?",
    "Where do you see yourself in the next 5 years, and how does this role fit into your career goals?"
];

type Feedback = {
    author: string;
    date: string;
    note: string;
};

export default function JobApplicantsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [job, setJob] = useState<CreatedJob | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [isStageChangeDialogOpen, setIsStageChangeDialogOpen] = useState(false);
    const [openCollapsibles, setOpenCollapsibles] = useState<string[]>(hiringStages);
    const [isPostingToLinkedIn, setIsPostingToLinkedIn] = useState(false);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [scoreThreshold, setScoreThreshold] = useState(0);
    const [isGrouped, setIsGrouped] = useState(false);
    const [sortBy, setSortBy] = useState('appliedAt-desc');
    const [dateFilter, setDateFilter] = useState('all');
    
    const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
    
    const [stageChangeNote, setStageChangeNote] = useState('');
    const [newNote, setNewNote] = useState('');
    const [feedbackNotes, setFeedbackNotes] = useState<Record<string, Feedback[]>>({});

    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
    const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [jobRes, pipeRes] = await Promise.all([
                jobsApi.get(id),
                pipelinesApi.list({ jobId: id, limit: 100 })
            ]);
            setJob(jobRes);
            setApplicants(pipeRes.items.map(mapPipelineToApplicant));
        } catch (error) {
            toast({
                title: 'Failed to load data',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        if (selectedApplicant) {
            const updated = applicants.find(a => a.id === selectedApplicant.id);
            if (updated) {
                // We compare IDs or deep compare if needed, but usually re-setting is fine if we want latest data
                // Only update if something actually changed to avoid infinite loops if loadData is called frequently
                if (updated.matchScore !== selectedApplicant.matchScore || updated.summary !== selectedApplicant.summary) {
                    setSelectedApplicant(updated);
                }
            }
        }
    }, [applicants, selectedApplicant]);

    const canManageJob = user?.companyRole === 'HR Admin';
    const canChangeStatus = user?.companyRole === 'HR Admin' || user?.companyRole === 'Hiring Manager';

    const filteredApplicants = useMemo(() => {
        let filtered = applicants.filter(app => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchLower === '' ||
                app.name.toLowerCase().includes(searchLower) ||
                app.email.toLowerCase().includes(searchLower) ||
                app.summary.toLowerCase().includes(searchLower);
            
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            const matchesScore = app.matchScore >= scoreThreshold;

            const appDate = new Date(app.appliedAt);
            const today = new Date();
            const last7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            
            let matchesDate = true;
            if (dateFilter === 'today') {
                matchesDate = appDate.toDateString() === today.toDateString();
            } else if (dateFilter === 'last7days') {
                matchesDate = appDate >= last7Days;
            }

            return matchesSearch && matchesStatus && matchesScore && matchesDate;
        });

        const [sortKey, sortDir] = sortBy.split('-');

        return filtered.sort((a, b) => {
            let valA, valB;
            if (sortKey === 'matchScore') {
                valA = a.matchScore;
                valB = b.matchScore;
            } else { // appliedAt
                valA = new Date(a.appliedAt).getTime();
                valB = new Date(b.appliedAt).getTime();
            }

            if (sortDir === 'asc') {
                return valA - valB;
            } else {
                return valB - valA;
            }
        });

    }, [applicants, searchTerm, statusFilter, scoreThreshold, dateFilter, sortBy]);

    const groupedApplicants = useMemo(() => {
        if (!isGrouped) return null;
        
        const grouped = filteredApplicants.reduce((acc, app) => {
            const { status } = app;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(app);
            return acc;
        }, {} as Record<string, Applicant[]>);
        
        return grouped;

    }, [filteredApplicants, isGrouped]);


    const getScoreColor = (score: number) => {
        if (score >= 90) return 'bg-emerald-500';
        if (score >= 75) return 'bg-yellow-400';
        if (score >= 50) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const handleStageChangeClick = (applicant: Applicant, stage: string) => {
        setSelectedApplicant(applicant);
        setSelectedStage(stage);
        setIsStageChangeDialogOpen(true);
    };

    const handleConfirmStageChange = async () => {
        if (!selectedApplicant || !selectedStage) return;
        
        try {
            await pipelinesApi.advance(selectedApplicant.id, { 
                stage: selectedStage, 
                note: stageChangeNote.trim() || undefined 
            });
            toast({
                title: 'Stage Updated',
                description: `Candidate moved to ${selectedStage}.`,
            });
            setIsStageChangeDialogOpen(false);
            setStageChangeNote('');
            void loadData();
        } catch (error) {
             toast({
                title: 'Action Failed',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        }
    };

    const [isEvaluating, setIsEvaluating] = useState(false);
    const handleAIEvaluate = async (pipelineId: string) => {
        setIsEvaluating(true);
        try {
            const pipe = applicants.find(a => a.id === pipelineId);
            await evaluationsApi.aiEvaluate({ 
                jobId: id, 
                candidateId: pipe?.candidateId || '', 
                pipelineId 
            });
            toast({
                title: 'Evaluation Complete',
                description: 'AI has analyzed the resume.',
            });
            void loadData();
        } catch (error) {
            toast({
                title: 'AI Evaluation Failed',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsEvaluating(false);
        }
    };

    
    const handleStageChangeDialogClose = (open: boolean) => {
        if (!open) {
            // This timeout ensures the dialog's closing animation completes
            // before we reset the state, preventing the UI from freezing.
            setTimeout(() => {
                const justChangedStage = selectedStage;
                setStageChangeNote('');
                
                // If the profile dialog is open, update its state, otherwise clear the selection
                if (isProfileDialogOpen && selectedApplicant && justChangedStage) {
                     setSelectedApplicant(prev => prev ? { ...prev, status: justChangedStage } : null);
                } else {
                    setSelectedApplicant(null);
                }
                setSelectedStage(null);

            }, 150);
        }
        setIsStageChangeDialogOpen(open);
    };


    const openProfileDialog = (applicant: Applicant) => {
        setSelectedApplicant(applicant);
        setIsProfileDialogOpen(true);
    }
    
    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !selectedApplicant) return;

        const feedbackToAdd: Feedback = {
            author: user!.name,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            note: newNote,
        };

        setFeedbackNotes(prev => {
            const existingFeedback = prev[selectedApplicant.id] || [];
            return {
                ...prev,
                [selectedApplicant.id]: [...existingFeedback, feedbackToAdd]
            };
        });

        toast({ title: 'Note saved!' });
        setNewNote('');
    };

    const handleShareJob = () => {
        if (!job) return;
        const jobUrl = `${window.location.origin}/jobs/${job.id}`;
        navigator.clipboard.writeText(jobUrl);
        toast({
            title: 'Link Copied!',
            description: 'The job link has been copied to your clipboard.',
        });
    };
    
    const handlePostToLinkedIn = async () => {
        if (!user?.linkedinProfileUrl) {
            toast({
                title: 'LinkedIn URL Missing',
                description: "Please add your company's LinkedIn profile URL in your account settings.",
                variant: 'destructive',
            });
            return;
        }
        if (!job) return;
        setIsPostingToLinkedIn(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsPostingToLinkedIn(false);
        toast({
            title: 'Posted to LinkedIn!',
            description: 'Your job has been posted successfully.',
        });
    };

    const toggleCollapsible = (stage: string) => {
        setOpenCollapsibles(prev => 
            prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
        );
    }

     const handleSelectForComparison = (applicantId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedForComparison(prev => [...prev, applicantId]);
        } else {
            setSelectedForComparison(prev => prev.filter(id => id !== applicantId));
        }
    };

    const toggleSelectAllForComparison = () => {
        const allFilteredIds = filteredApplicants.map(a => a.id);
        const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedForComparison.includes(id));

        if (allSelected) {
            setSelectedForComparison(prev => prev.filter(id => !allFilteredIds.includes(id)));
        } else {
            const idsToAdd = allFilteredIds.filter(id => !selectedForComparison.includes(id));
            setSelectedForComparison(prev => [...prev, ...idsToAdd]);
        }
    };

    const areAllApplicantsSelected = useMemo(() => {
        if (filteredApplicants.length === 0) return false;
        return filteredApplicants.every(a => selectedForComparison.includes(a.id));
    }, [filteredApplicants, selectedForComparison]);

    const candidatesToCompare = useMemo(() => {
        return applicants.filter(app => selectedForComparison.includes(app.id));
    }, [selectedForComparison, applicants]);

    const applicantInterview = useMemo(() => {
        if (!selectedApplicant) return null;
        return interviewsData.find(i => i.applicantId === selectedApplicant.id && i.status === 'completed');
    }, [selectedApplicant]);


    if (!job) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Job not found</h2>
                    <p className="text-muted-foreground">The job posting you are looking for does not exist.</p>
                    <Button asChild className="mt-4">
                        <Link href="/job-postings">Go to Job Postings</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const renderApplicantRow = (applicant: Applicant) => (
        <TableBody key={applicant.id} className="group hover:bg-muted/50 border-b">
            <TableRow className="border-b-0 group-hover:bg-transparent">
                <TableCell className="pl-4 w-12">
                    <Checkbox
                        id={`select-${applicant.id}`}
                        checked={selectedForComparison.includes(applicant.id)}
                        onCheckedChange={(checked) => handleSelectForComparison(applicant.id, !!checked)}
                        aria-label={`Select ${applicant.name}`}
                    />
                </TableCell>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>{getInitials(applicant.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{applicant.name}</p>
                            <p className="text-sm text-muted-foreground">{applicant.email}</p>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{applicant.matchScore}%</span>
                        <Progress 
                            value={applicant.matchScore} 
                            className="h-2 w-[100px] bg-slate-200" 
                            indicatorClassName={getScoreColor(applicant.matchScore)} 
                        />
                    </div>
                </TableCell>
                 {!isGrouped && (
                    <TableCell>
                        <Badge 
                            variant={statusVariantMap[applicant.status] || 'secondary'} 
                            className={`${statusClassMap[applicant.status]} capitalize hover:${statusClassMap[applicant.status]}`}
                        >
                            {applicant.status}
                        </Badge>
                    </TableCell>
                )}
                <TableCell className='text-right'>
                <div className='flex gap-2 justify-end'>
                         <Button variant="outline" size="sm" onClick={() => openProfileDialog(applicant)}>
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                        </Button>
                        {canChangeStatus && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Change Stage
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {hiringStages.filter(s => s !== applicant.status).map(s => (
                                        <DropdownMenuItem key={s} onSelect={() => handleStageChangeClick(applicant, s)} className='capitalize'>
                                            {s}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                </div>
                </TableCell>
            </TableRow>
            <TableRow className="group-hover:bg-transparent">
                <TableCell colSpan={isGrouped ? 4 : 5} className="py-2 px-4 pt-0 pl-16">
                    <p className="text-sm text-muted-foreground">{applicant.summary}</p>
                </TableCell>
            </TableRow>
        </TableBody>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Job Post</p>
                    <h1 className="text-3xl font-bold font-headline">{job.title}</h1>
                </div>
                <div className='flex gap-2'>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    {canManageJob && (
                        <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Actions
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/job-postings/${job.id}/edit`}>
                                    <FileEdit className="mr-2 h-4 w-4" />
                                    Edit Job
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Close Job
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleShareJob}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Copy Public Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handlePostToLinkedIn} disabled={isPostingToLinkedIn}>
                                    {isPostingToLinkedIn ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Linkedin className="mr-2 h-4 w-4" />
                                    )}
                                    {isPostingToLinkedIn ? 'Posting...' : 'Post to LinkedIn'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </>
                    )}
                </div>
            </div>

            <Card>
                <CardContent className='pt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end'>
                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="search">Keyword Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="search"
                                placeholder="Filter by name, email, skill..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id='status'>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {hiringStages.map(stage => (
                                    <SelectItem key={stage} value={stage} className="capitalize">{stage}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="date">Date Applied</Label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger id='date'>
                                <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="last7days">Last 7 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="score-threshold">Match Score</Label>
                        <Select value={String(scoreThreshold)} onValueChange={(value) => setScoreThreshold(Number(value))}>
                            <SelectTrigger id="score-threshold">
                                <SelectValue placeholder="Filter by score" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Any</SelectItem>
                                <SelectItem value="90">90%+</SelectItem>
                                <SelectItem value="75">75%+</SelectItem>
                                <SelectItem value="50">50%+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sort-by">Sort by</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger id='sort-by'>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="matchScore-desc">Match Score: High to Low</SelectItem>
                                <SelectItem value="matchScore-asc">Match Score: Low to High</SelectItem>
                                <SelectItem value="appliedAt-desc">Date Applied: Newest</SelectItem>
                                <SelectItem value="appliedAt-asc">Date Applied: Oldest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label className="text-transparent select-none h-[18px] block">.</Label>
                        <div className="flex items-center h-10 space-x-2">
                            <Switch id="group-by-status" checked={isGrouped} onCheckedChange={setIsGrouped} />
                            <Label htmlFor="group-by-status" className="font-normal">Group by Status</Label>
                        </div>
                    </div>
                </CardContent>
                <Separator />
                <CardFooter className="py-3 px-6 justify-end">
                    <Button
                        onClick={() => setIsComparisonDialogOpen(true)}
                        disabled={selectedForComparison.length < 2}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        Compare ({selectedForComparison.length})
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-4">
                {isGrouped && groupedApplicants && hiringStages.map(stage => {
                    const stageApplicants = groupedApplicants[stage];
                    if (!stageApplicants || stageApplicants.length === 0) return null;
                    const isOpen = openCollapsibles.includes(stage);

                    return (
                         <Collapsible key={stage} open={isOpen} onOpenChange={() => toggleCollapsible(stage)} asChild>
                             <div className="border rounded-lg">
                                <CollapsibleTrigger asChild>
                                    <div className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 rounded-t-lg cursor-pointer">
                                         <div className='flex items-center gap-3'>
                                             <Badge
                                                 variant={statusVariantMap[stage] || 'secondary'}
                                                 className={`${statusClassMap[stage]} capitalize text-base hover:${statusClassMap[stage]}`}
                                             >
                                                 {stage}
                                             </Badge>
                                             <span className='font-semibold'>{stageApplicants.length} Applicants</span>
                                         </div>
                                         <Button asChild variant="ghost" size="sm" className="p-1 h-auto">
                                            <div>
                                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                <span className="sr-only">Toggle</span>
                                            </div>
                                         </Button>
                                     </div>
                                 </CollapsibleTrigger>
                                 <CollapsibleContent>
                                     <Table className="min-w-[800px]">
                                         <TableHeader>
                                             <TableRow>
                                                 <TableHead className="pl-4 w-12"></TableHead>
                                                 <TableHead className='w-[60%] min-w-[300px]'>Candidate</TableHead>
                                                 <TableHead>Match Score</TableHead>
                                                 <TableHead className='text-right'>Actions</TableHead>
                                             </TableRow>
                                         </TableHeader>
                                         {stageApplicants.map(renderApplicantRow)}
                                     </Table>
                                 </CollapsibleContent>
                             </div>
                         </Collapsible>
                    )
                })}

                {!isGrouped && (
                     <Card>
                        <CardContent className="p-0 border-t">
                             <Table className="min-w-[800px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-4 w-12">
                                            {filteredApplicants.length > 0 && (
                                                <Checkbox
                                                    checked={areAllApplicantsSelected}
                                                    onCheckedChange={toggleSelectAllForComparison}
                                                    aria-label="Select all filtered applicants"
                                                />
                                            )}
                                        </TableHead>
                                        <TableHead className='w-[40%] min-w-[300px]'>Candidate</TableHead>
                                        <TableHead>Match Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className='text-right'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                {filteredApplicants.map(renderApplicantRow)}
                            </Table>
                             {filteredApplicants.length === 0 && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No applicants found.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </CardContent>
                     </Card>
                )}
             </div>


            <AlertDialog open={isStageChangeDialogOpen} onOpenChange={handleStageChangeDialogClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change applicant stage</AlertDialogTitle>
                        <AlertDialogDescription>
                            Move <span className='font-bold'>{selectedApplicant?.name}</span> to the <span className='font-bold capitalize'>{selectedStage}</span> stage. You can add an optional note below.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="stage-change-note" className="font-semibold">Add a note (optional)</Label>
                        <Textarea 
                            id="stage-change-note" 
                            placeholder={`Reason for moving to ${selectedStage}...`} 
                            className="mt-2 min-h-[100px]"
                            value={stageChangeNote}
                            onChange={(e) => setStageChangeNote(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmStageChange}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                     {selectedApplicant && (
                         <>
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl">{selectedApplicant.name}</DialogTitle>
                            <DialogDescription>Applying for {job.title}</DialogDescription>
                        </DialogHeader>
                        <div className="grid lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                            <div className="lg:col-span-1 space-y-6 flex flex-col">
                                <Card className="flex flex-col">
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <Avatar className="h-24 w-24 mb-4">
                                    <AvatarFallback className="font-medium">{getInitials(selectedApplicant.name)}</AvatarFallback>
                                    </Avatar>
                                    <Button className="mt-4 w-full">
                                        <CalendarPlus className="mr-2 h-4 w-4"/>
                                        Schedule Interview
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="mt-2 w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                        onClick={() => handleAIEvaluate(selectedApplicant.id)}
                                        disabled={isEvaluating}
                                    >
                                        {isEvaluating ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="mr-2 h-4 w-4" />
                                        )}
                                        {selectedApplicant.matchScore > 0 ? 'Re-Evaluate with AI' : 'Evaluate with AI'}
                                    </Button>
                                </CardContent>
                                <CardContent className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">Contact Information</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                    <a href={`mailto:${selectedApplicant.email}`} className="flex items-center gap-2 hover:text-primary">
                                        <Mail className="h-4 w-4" /> <span>{selectedApplicant.email}</span>
                                    </a>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" /> <span>{selectedApplicant.phone || 'N/A'}</span>
                                    </div>
                                    <a href={selectedApplicant.linkedin ? `https://${selectedApplicant.linkedin}` : '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                                        <Linkedin className="h-4 w-4" /> <span>{selectedApplicant.linkedin || 'N/A'}</span>
                                    </a>
                                    </div>
                                </CardContent>
                                <CardContent className="border-t pt-4 mt-auto space-y-2">
                                    {selectedApplicant.resumeUrl ? (
                                        <Button asChild variant="outline" className="w-full">
                                            <a href={selectedApplicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                                                <FileText className="mr-2 h-4 w-4" /> Download Resume
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => toast({ title: "No resume attached", description: "Candidate did not provide a resume file.", variant: "destructive" })}
                                        >
                                            <FileText className="mr-2 h-4 w-4" /> No Resume
                                        </Button>
                                    )}
                                    {canChangeStatus && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button className="w-full">
                                                    Change Stage
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {hiringStages.filter(s => s !== selectedApplicant.status).map(s => (
                                                    <DropdownMenuItem key={s} onSelect={() => handleStageChangeClick(selectedApplicant, s)} className='capitalize'>
                                                        {s}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </CardContent>
                                </Card>
                            </div>
                            <ScrollArea className="lg:col-span-2">
                                <div className="space-y-6 pr-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='flex items-center justify-between'>
                                            <span>AI Match Score</span>
                                            <span className="font-bold text-primary text-2xl">{selectedApplicant.matchScore}%</span>
                                        </CardTitle>
                                        <CardDescription>Based on resume and job description.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Progress value={selectedApplicant.matchScore} className="h-3" indicatorClassName={getScoreColor(selectedApplicant.matchScore)} />
                                        <Separator className="my-4" />
                                        <h4 className="text-sm font-semibold mb-3">Score Breakdown</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-muted-foreground">Skill Depth & Relevance</span>
                                                <span className="font-semibold">{selectedApplicant.skillScore !== undefined ? `${selectedApplicant.skillScore}%` : '--'}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-muted-foreground">Role Experience Similarity</span>
                                                <span className="font-semibold">{selectedApplicant.experienceScore !== undefined ? `${selectedApplicant.experienceScore}%` : '--'}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-muted-foreground">Candidate Relevance</span>
                                                <span className="font-semibold">{selectedApplicant.relevanceScore !== undefined ? `${selectedApplicant.relevanceScore}%` : '--'}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-muted-foreground">Career Trajectory</span>
                                                <span className="font-semibold capitalize">
                                                    {selectedApplicant.trajectoryClassification 
                                                        ? selectedApplicant.trajectoryClassification.replace(/_/g, ' ') 
                                                        : '--'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-muted-foreground">Risk Flags</span>
                                                <div className="font-semibold text-yellow-600 flex items-center gap-1">
                                                    <ShieldAlert className="h-4 w-4" />
                                                    <span>{selectedApplicant.matchScore > 0 && selectedApplicant.matchScore < 60 ? 'Identified' : 'Low'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Application Summary</CardTitle>
                                        <CardDescription>A TLDR of the candidate's profile, generated by AI.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-blue-500" /> Candidate Summary</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedApplicant.summary}
                                            </p>
                                        </div>
                                        {selectedApplicant.keySkills && (
                                            <div>
                                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-yellow-500" /> Key Skills</h4>
                                                <div className="flex flex-wrap gap-2 pl-4">
                                                    {selectedApplicant.keySkills.map((skill, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Briefcase className="h-4 w-4 text-purple-500" /> Experience Summary</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedApplicant.experienceSummary || 'No experience summary available.'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-green-500" /> Career Trajectory</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedApplicant.trajectorySummary || 'No trajectory analysis available.'}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><ShieldAlert className="h-4 w-4 text-red-500" /> Risk Flags</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedApplicant.riskFlags || 'No significant risks identified.'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <MessageSquareQuote className="h-5 w-5 text-primary" />
                                                <span>Suggested Interview Questions</span>
                                            </CardTitle>
                                            <Button variant="ghost" size="icon" onClick={() => handleRegenerateQuestions()}>
                                                <RefreshCw className="h-4 w-4" />
                                                <span className="sr-only">Regenerate Questions</span>
                                            </Button>
                                        </div>
                                        <CardDescription>AI-generated questions based on the candidate's profile. Click the refresh icon to get a new set.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-2">
                                            {(selectedApplicant.interviewQuestions || interviewQuestions).map((q, i) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                            {(!selectedApplicant.interviewQuestions && interviewQuestions.length === 0) && (
                                                <p className="text-center italic">No suggested questions available. Run AI evaluation first.</p>
                                            )}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {applicantInterview && (
                                    <Card className="border-primary/20 bg-primary/5">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BrainCircuit className="h-5 w-5 text-primary" />
                                                <span>AI Interview Intelligence</span>
                                            </CardTitle>
                                            <CardDescription>Comprehensive analysis of the candidate's last interview performance.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-yellow-500" /> AI Summary</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {applicantInterview.aiAnalysis?.summary}
                                                </p>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <h5 className="text-xs font-bold text-green-600 uppercase tracking-wider">Key Strengths</h5>
                                                    <ul className="text-xs space-y-1 text-muted-foreground">
                                                        {applicantInterview.aiAnalysis?.strengths.map((s, i) => (
                                                            <li key={i} className="flex items-center gap-1">
                                                                <div className="h-1 w-1 rounded-full bg-green-600" /> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-2">
                                                    <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Areas for Growth</h5>
                                                    <ul className="text-xs space-y-1 text-muted-foreground">
                                                        {applicantInterview.aiAnalysis?.weaknesses.map((w, i) => (
                                                            <li key={i} className="flex items-center gap-1">
                                                                <div className="h-1 w-1 rounded-full bg-orange-600" /> {w}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <Card className="bg-white/50 border-primary/10">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">Hiring Recommendation</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm font-medium text-primary italic">
                                                        "{applicantInterview.aiAnalysis?.recommendation}"
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessagesSquare className="h-5 w-5 text-primary" />
                                            <span>Internal Feedback & Notes</span>
                                        </CardTitle>
                                        <CardDescription>Record your thoughts on this candidate. Only visible to your team.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ScrollArea className="h-40 pr-4">
                                            <div className="space-y-4">
                                                 {(feedbackNotes[selectedApplicant.id] || []).map((note, index) => (
                                                    <div key={index} className="border-l-2 border-slate-200 pl-3 text-sm">
                                                        <p className="font-semibold">{note.author} <span className="text-muted-foreground font-normal">- {note.date}</span></p>
                                                        <p className="text-muted-foreground italic">"{note.note}"</p>
                                                    </div>
                                                ))}
                                                {(!feedbackNotes[selectedApplicant.id] || feedbackNotes[selectedApplicant.id].length === 0) && (
                                                    <p className="text-sm text-muted-foreground text-center pt-8">No feedback yet.</p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                        <Separator />
                                        <form onSubmit={handleAddNote}>
                                            <Label htmlFor="feedback-note" className="font-semibold">Add a new note</Label>
                                            <Textarea 
                                                id="feedback-note" 
                                                placeholder="Your feedback..." 
                                                className="mt-2 min-h-[100px]"
                                                value={newNote}
                                                onChange={e => setNewNote(e.target.value)}
                                             />
                                            <Button className="mt-2" type="submit">Save Note</Button>
                                        </form>
                                    </CardContent>
                                </Card>
                                </div>
                            </ScrollArea>
                        </div>
                        </>
                     )}
                </DialogContent>
            </Dialog>

            <Dialog open={isComparisonDialogOpen} onOpenChange={setIsComparisonDialogOpen}>
                <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Candidate Comparison</DialogTitle>
                        <DialogDescription>
                            Side-by-side comparison for selected candidates.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px] font-semibold">Candidate</TableHead>
                                    {candidatesToCompare.map(candidate => (
                                        <TableHead key={candidate.id}>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold">{candidate.name}</span>
                                                <span className="text-xs font-normal text-muted-foreground">{candidate.email}</span>
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-semibold">Status</TableCell>
                                    {candidatesToCompare.map(candidate => (
                                        <TableCell key={candidate.id}>
                                            <Badge 
                                                variant={statusVariantMap[candidate.status] || 'secondary'} 
                                                className={`${statusClassMap[candidate.status]} capitalize`}
                                            >
                                                {candidate.status}
                                            </Badge>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Match Score</TableCell>
                                    {candidatesToCompare.map(candidate => (
                                        <TableCell key={candidate.id}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg">{candidate.matchScore}%</span>
                                                <Progress 
                                                    value={candidate.matchScore} 
                                                    className="h-2 w-[100px] bg-slate-200" 
                                                    indicatorClassName={getScoreColor(candidate.matchScore)} 
                                                />
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold align-top">Summary</TableCell>
                                    {candidatesToCompare.map(candidate => (
                                        <TableCell key={candidate.id} className="text-sm text-muted-foreground align-top">
                                            {candidate.summary}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold align-top">
                                        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-500" /> Key Skills</div>
                                    </TableCell>
                                    {candidatesToCompare.map(candidate => (
                                        <TableCell key={candidate.id} className="align-top">
                                            <div className="flex flex-wrap gap-1">
                                                {(candidate.keySkills || []).map((skill, i) => (
                                                    <Badge key={i} variant="outline" className="text-[10px] py-0">{skill}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold align-top">
                                        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-purple-500" /> Experience</div>
                                    </TableCell>
                                    {candidatesToCompare.map(candidate => (
                                        <TableCell key={candidate.id} className="text-sm text-muted-foreground align-top">
                                            {candidate.experienceSummary || 'Professional background in relevant technologies and roles.'}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold align-top">
                                        <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Career Trajectory</div>
                                    </TableCell>
                                    {candidatesToCompare.map(candidate => (
                                        <TableCell key={candidate.id} className="text-sm text-muted-foreground align-top">
                                            {candidate.trajectorySummary || 'Consistent growth and increasing responsibility throughout career.'}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold align-top">
                                    <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-500" /> Risk Flags</div>
                                    </TableCell>
                                    {candidatesToCompare.map(candidate => (
                                        <TableCell key={candidate.id} className="text-sm text-muted-foreground align-top">
                                            {candidate.riskFlags || 'Low risk. Profile appears stable and well-aligned.'}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold align-top">Internal Feedback</TableCell>
                                    {candidatesToCompare.map(candidate => (
                                        <TableCell key={candidate.id} className="align-top">
                                            <div className="space-y-2">
                                                {(feedbackNotes[candidate.id] || []).map((note, index) => (
                                                    <div key={index} className="border-l-2 border-slate-200 pl-3 text-xs">
                                                        <p className="font-semibold">{note.author} <span className="text-muted-foreground font-normal">- {note.date}</span></p>
                                                        <p className="text-muted-foreground italic">"{note.note}"</p>
                                                    </div>
                                                ))}
                                                {(!feedbackNotes[candidate.id] || feedbackNotes[candidate.id].length === 0) && (
                                                    <p className="text-xs text-muted-foreground text-center">No feedback yet.</p>
                                                )}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
