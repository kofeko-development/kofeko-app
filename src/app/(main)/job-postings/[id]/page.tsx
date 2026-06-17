
'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown, ChevronUp, Search, ArrowLeft, Share2, Linkedin, Loader2, FileEdit, Trash2, Mail, Phone, FileText, CalendarPlus, Sparkles, CheckCircle, AlertTriangle, MessageSquareQuote, TrendingUp, ShieldAlert, Briefcase, MessagesSquare, RefreshCw, Users, BrainCircuit, Settings, ArrowUp, ArrowDown, Lock, Info, Plus } from 'lucide-react';
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
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { useAuth } from '@/lib/auth';
import { Applicant } from '@/lib/data';
import { interviewsData } from '@/lib/interviews-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { jobsApi, pipelinesApi, evaluationsApi, ApiPipeline, CreatedJob } from '@/lib/stage1-2-api';
import { resolveHiringStageLabel } from '@/lib/hiring-stages';
import { LinkedInShareModal } from '@/components/linkedin-share-modal';
import { EditJobDialog } from '@/components/edit-job-dialog';
import {
    parseHiringIntelligence,
    hasAiEvaluation,
    getEvaluationScore,
    formatMatchScoreLabel,
    getMatchScoreProgress,
    buildRankMap,
    formatBatchEvaluationMessage,
} from '@/lib/evaluation-utils';

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

function mapPipelineToApplicant(
    p: ApiPipeline,
    rankByCandidateId?: Map<string, number>,
): Applicant {
    const evaluation = (p as any).evaluation || (p.evaluations && p.evaluations[0]);
    const hi = parseHiringIntelligence(evaluation?.hiringIntelligence);
    const evaluated = hasAiEvaluation(evaluation);
    const score = getEvaluationScore(evaluation);

    return {
        id: p.id,
        candidateId: p.candidateId,
        name: `${p.candidate.firstName} ${p.candidate.lastName}`,
        email: p.candidate.email,
        status: p.stage as any,
        appliedAt: p.createdAt,
        hasEvaluation: evaluated,
        evaluationId: evaluation?.id,
        evaluationRank: rankByCandidateId?.get(p.candidateId),
        matchScore: evaluated && score !== null ? score : 0,
        summary: (hi?.applicationSummary as string) || evaluation?.whyCard || evaluation?.summary || '',
        phone: p.candidate.phoneNumber || undefined,
        linkedin: p.candidate.linkedinUrl || undefined,
        resumeUrl: p.candidate.resumeUrl || undefined,
        keySkills: (hi?.keySkills || (evaluation?.skillMatches as any[])
            ? (evaluation?.skillMatches as any[])?.filter((s: any) => s.matched).map((s: any) => s.skill)
            : p.candidate.skills) || [],
        experienceSummary:
            (hi?.experienceSummary as { narrative?: string } | undefined)?.narrative ||
            evaluation?.roleFitNotes ||
            undefined,
        trajectorySummary:
            (hi?.careerTrajectory as { explanation?: string } | undefined)?.explanation ||
            evaluation?.rankingSummary ||
            undefined,
        riskFlags: Array.isArray(hi?.riskFlags)
            ? (hi.riskFlags as string[]).join(', ')
            : typeof hi?.riskFlags === 'string'
              ? hi.riskFlags
              : undefined,
        interviewQuestions: Array.isArray(hi?.suggestedInterviewQuestions)
            ? (hi.suggestedInterviewQuestions as string[])
            : undefined,
        relevanceScore: (hi?.relevanceToRole as { matchScorePercent?: number } | undefined)?.matchScorePercent || undefined,
        skillScore: (hi?.skillsAnalysis as { matchScorePercent?: number } | undefined)?.matchScorePercent || undefined,
        experienceScore: (hi?.experienceSummary as { matchScorePercent?: number } | undefined)?.matchScorePercent || undefined,
        trajectoryClassification: (hi?.careerTrajectory as { classification?: string } | undefined)?.classification || undefined,
        notes: (() => {
            if (!p.notes) return [];
            if (typeof p.notes !== 'string') return p.notes;
            try { return JSON.parse(p.notes); } catch { return []; }
        })(),
    };
}

type Feedback = {
    author: string;
    date: string;
    note: string;
};

export default function JobApplicantsPage() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');
    const routePrefix = isAdmin ? '/admin' : '';
    const id = params.id as string;
    const { user, hasPermission } = useAuth();
    const { toast } = useToast();
    const { showError } = useApiErrorToast();

    const [job, setJob] = useState<CreatedJob | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const defaultFlowStages = useMemo(() => [
        { stage: 'applied', label: 'Applied', order: 1, enabled: true },
        { stage: 'screening', label: 'Screening', order: 2, enabled: true },
        { stage: 'technical_interview', label: 'Technical Interview', order: 3, enabled: true },
        { stage: 'hr_interview', label: 'HR Interview', order: 4, enabled: true },
        { stage: 'offer', label: 'Offer', order: 5, enabled: true },
        { stage: 'hired', label: 'Hired', order: 6, enabled: true },
        { stage: 'rejected', label: 'Rejected', order: 7, enabled: true },
    ], []);

    const [isCustomizeFlowDialogOpen, setIsCustomizeFlowDialogOpen] = useState(false);
    const [isEditJobDialogOpen, setIsEditJobDialogOpen] = useState(false);
    const [flowStages, setFlowStages] = useState<any[]>([]);
    const [isSavingFlow, setIsSavingFlow] = useState(false);

    const customStagesConfig = useMemo(() => {
        if (job?.customStages && Array.isArray(job.customStages)) {
            return job.customStages;
        }
        return defaultFlowStages;
    }, [job, defaultFlowStages]);

    const activeHiringStages = useMemo(() => {
        const sorted = [...customStagesConfig].sort((a, b) => a.order - b.order);
        return sorted.filter(s => s.enabled).map(s => s.stage);
    }, [customStagesConfig]);

    const getStageLabel = useCallback((stageKey: string | null) => {
        if (!stageKey) return '';
        const stageObj = customStagesConfig.find(s => s.stage === stageKey);
        return stageObj ? resolveHiringStageLabel(stageObj) : resolveHiringStageLabel({ stage: stageKey, label: null });
    }, [customStagesConfig]);

    const openCustomizeFlowDialog = () => {
        if (job) {
            let stagesToSet = defaultFlowStages;
            if (job.customStages && Array.isArray(job.customStages)) {
                stagesToSet = job.customStages;
            }

            // Filter out disabled middle stages so the builder is a clean active-only list
            const activeOnly = stagesToSet.filter(s => s.enabled || s.stage === 'applied' || s.stage === 'hired' || s.stage === 'rejected');

            // Re-order them sequentially
            const sortedAndCleaned = JSON.parse(JSON.stringify(activeOnly))
                .sort((a: any, b: any) => a.order - b.order);

            sortedAndCleaned.forEach((s: any, idx: number) => { s.order = idx + 1; s.enabled = true; });

            setFlowStages(sortedAndCleaned);
            setIsCustomizeFlowDialogOpen(true);
        }
    };

    const handleRenameStage = (index: number, newLabel: string) => {
        const updated = [...flowStages];
        updated[index].label = newLabel;
        setFlowStages(updated);
    };

    const handleDeleteStage = (index: number) => {
        const stageKey = flowStages[index].stage;
        if (stageKey === 'applied' || stageKey === 'hired' || stageKey === 'rejected') {
            return;
        }
        const updated = [...flowStages];
        updated.splice(index, 1);
        updated.forEach((s, idx) => { s.order = idx + 1; });
        setFlowStages(updated);
    };

    const handleAddStage = () => {
        const newStage = {
            stage: `custom_${Date.now()}`,
            label: 'New Stage',
            order: 0,
            enabled: true,
        };
        const updated = [...flowStages];
        updated.splice(updated.length - 2, 0, newStage);
        updated.forEach((s, idx) => { s.order = idx + 1; });
        setFlowStages(updated);
    };

    const handleMoveStage = (index: number, direction: 'up' | 'down') => {
        const minIndex = 1;
        const maxIndex = flowStages.length - 3;

        if (direction === 'up' && index > minIndex) {
            const updated = [...flowStages];
            const temp = updated[index];
            updated[index] = updated[index - 1];
            updated[index - 1] = temp;
            updated.forEach((s, idx) => { s.order = idx + 1; });
            setFlowStages(updated);
        } else if (direction === 'down' && index < maxIndex) {
            const updated = [...flowStages];
            const temp = updated[index];
            updated[index] = updated[index + 1];
            updated[index + 1] = temp;
            updated.forEach((s, idx) => { s.order = idx + 1; });
            setFlowStages(updated);
        }
    };

    const handleSaveFlow = async () => {
        setIsSavingFlow(true);
        try {
            await jobsApi.update(id, { customStages: flowStages });
            toast({
                title: 'Hiring Flow Updated',
                description: 'The customizable recruitment flow has been successfully saved.',
            });
            setIsCustomizeFlowDialogOpen(false);
            void loadData();
        } catch (error) {
            toast({
                title: 'Failed to save flow',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSavingFlow(false);
        }
    };

    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [isStageChangeDialogOpen, setIsStageChangeDialogOpen] = useState(false);
    const [openCollapsibles, setOpenCollapsibles] = useState<string[]>(hiringStages);
    const [isLinkedInDialogOpen, setIsLinkedInDialogOpen] = useState(false);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [scoreThreshold, setScoreThreshold] = useState(0);
    const [isGrouped, setIsGrouped] = useState(false);
    const [sortBy, setSortBy] = useState('appliedAt-desc');
    const [dateFilter, setDateFilter] = useState('all');

    const [evaluatingPipelineId, setEvaluatingPipelineId] = useState<string | null>(null);
    const [stageChangeNote, setStageChangeNote] = useState('');
    const [newNote, setNewNote] = useState('');
    const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

    const [isClosingJob, setIsClosingJob] = useState(false);


    const handleCloseJob = async () => {
        try {
            setIsClosingJob(true);
            await jobsApi.close(id);
            toast({
                title: 'Job Closed',
                description: 'This job has been closed and moved to the closed section.',
            });
            void loadData();
        } catch (error) {
            toast({
                title: 'Failed to close job',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsClosingJob(false);
        }
    };

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [jobRes, pipeRes, rankingsRes] = await Promise.all([
                jobsApi.get(id),
                pipelinesApi.list({ jobId: id, limit: 100 }),
                evaluationsApi.getRankings(id).catch(() => []),
            ]);
            const rankMap = buildRankMap(rankingsRes);
            setJob(jobRes);
            setApplicants(pipeRes.items.map((p) => mapPipelineToApplicant(p, rankMap)));
        } catch (error) {
            showError(error);
        } finally {
            setIsLoading(false);
        }
    }, [id, showError]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        if (selectedApplicant) {
            const updated = applicants.find((a) => a.id === selectedApplicant.id);
            if (updated) {
                setSelectedApplicant(updated);
            }
        }
    }, [applicants, selectedApplicant?.id]);

    const canManageJob = user?.companyRole === 'Company Admin' || user?.companyRole === 'Hiring Manager';
    const canChangeStatus = user?.companyRole === 'Company Admin' || user?.companyRole === 'Hiring Manager';
    const canShareLinkedIn = hasPermission('linkedin:post');
    const canRunAiEvaluation = hasPermission('evaluation:create');
    const hasJobSkillWeights =
        Array.isArray(job?.skillWeights) && (job.skillWeights as unknown[]).length > 0;
    const jobIsOpen = job?.status === 'open';
    const canBatchEvaluate =
        canRunAiEvaluation && jobIsOpen && hasJobSkillWeights && applicants.length > 0;

    const filteredApplicants = useMemo(() => {
        let filtered = applicants.filter(app => {
            const searchLower = searchTerm.toLowerCase();
            const summaryText = (app.summary ?? '').toLowerCase();
            const matchesSearch = searchLower === '' ||
                app.name.toLowerCase().includes(searchLower) ||
                app.email.toLowerCase().includes(searchLower) ||
                summaryText.includes(searchLower);

            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            const matchesScore =
                scoreThreshold === 0 || !app.hasEvaluation || app.matchScore >= scoreThreshold;

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
            let valA: number, valB: number;
            if (sortKey === 'matchScore') {
                valA = a.hasEvaluation ? a.matchScore : -1;
                valB = b.hasEvaluation ? b.matchScore : -1;
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

    const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);

    const getAiEvaluateDisabledReason = (applicant: Applicant): string | undefined => {
        if (!jobIsOpen) return 'AI evaluation is only available for open jobs';
        if (!hasJobSkillWeights) return 'Add skill weights to this job before running AI evaluation';
        if (!applicant.resumeUrl) return 'Upload a resume before running AI evaluation';
        if (isBatchEvaluating) return 'Wait for batch evaluation to finish';
        if (evaluatingPipelineId && evaluatingPipelineId !== applicant.id) return 'Another evaluation is in progress';
        return undefined;
    };

    const handleAIEvaluate = async (pipelineId: string) => {
        const pipe = applicants.find((a) => a.id === pipelineId);
        if (!pipe?.candidateId) {
            toast({ title: 'Candidate not found', variant: 'destructive' });
            return;
        }
        if (!jobIsOpen) {
            toast({
                title: 'Job not open',
                description: 'AI evaluation is only available for open job postings.',
                variant: 'destructive',
            });
            return;
        }
        if (!pipe.resumeUrl) {
            toast({
                title: 'No Resume',
                description: 'Please upload a resume before running AI evaluation.',
                variant: 'destructive',
            });
            return;
        }
        if (!hasJobSkillWeights) {
            toast({
                title: 'No Skill Weights',
                description: 'Add skill priorities to the job before running AI evaluation.',
                variant: 'destructive',
            });
            return;
        }
        if (isBatchEvaluating) {
            toast({
                title: 'Batch in progress',
                description: 'Wait for batch evaluation to finish before evaluating one candidate.',
                variant: 'destructive',
            });
            return;
        }

        setEvaluatingPipelineId(pipelineId);
        try {
            await evaluationsApi.aiEvaluate({
                jobId: id,
                candidateId: pipe.candidateId,
                pipelineId,
            });
            toast({
                title: 'Evaluation Complete',
                description: 'AI has analyzed the resume.',
            });
            await loadData();
        } catch (error) {
            showError(error);
        } finally {
            setEvaluatingPipelineId(null);
        }
    };

    const handleEvaluateAll = async () => {
        if (applicants.length === 0) {
            toast({
                title: 'No candidates',
                description: 'Add candidates to this job before running batch evaluation.',
                variant: 'destructive',
            });
            return;
        }
        if (!hasJobSkillWeights) {
            toast({
                title: 'No Skill Weights',
                description: 'Add skill priorities to the job before running batch evaluation.',
                variant: 'destructive',
            });
            return;
        }
        if (!jobIsOpen) {
            toast({
                title: 'Job not open',
                description: 'Batch evaluation is only available for open job postings.',
                variant: 'destructive',
            });
            return;
        }
        setIsBatchEvaluating(true);
        try {
            const result = await evaluationsApi.evaluateAll(id);
            const msg = formatBatchEvaluationMessage(result, applicants.length);
            toast({
                title: msg.title,
                description: msg.description,
                variant: result.failed > 0 && result.evaluated === 0 ? 'destructive' : 'default',
            });
            await loadData();
        } catch (error) {
            showError(error);
        } finally {
            setIsBatchEvaluating(false);
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
                    setSelectedApplicant(prev => prev ? { ...prev, status: justChangedStage as Applicant['status'] } : null);
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

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !selectedApplicant) return;

        try {
            await pipelinesApi.addNote(selectedApplicant.id, newNote);
            toast({ title: 'Note saved successfully!' });
            setNewNote('');
            void loadData(); // Re-fetch to get updated notes

            // Optionally update local state immediately so UI feels fast
            setSelectedApplicant(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    notes: [
                        ...(prev.notes || []),
                        {
                            author: user!.name,
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            note: newNote
                        }
                    ]
                };
            });
        } catch (error) {
            toast({ title: 'Failed to save note', variant: 'destructive' });
        }
    };

    const handleShareJob = () => {
        if (!job) return;
        const jobUrl = `${window.location.origin}/open-positions/${job.id}`;
        navigator.clipboard.writeText(jobUrl);
        toast({
            title: 'Link Copied!',
            description: 'Candidate job link copied. Share it so applicants can view and apply.',
        });
    };

    const handlePostToLinkedIn = () => {
        setIsLinkedInDialogOpen(true);
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


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground mt-2">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Job not found</h2>
                    <p className="text-muted-foreground">The job posting you are looking for does not exist.</p>
                    <Button asChild className="mt-4">
                        <Link href={`${routePrefix}/job-postings`}>Go to Job Postings</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const renderApplicantRow = (applicant: Applicant) => {
        const scoreLabel = formatMatchScoreLabel(!!applicant.hasEvaluation, applicant.hasEvaluation ? applicant.matchScore : null);
        const progressValue = getMatchScoreProgress(!!applicant.hasEvaluation, applicant.hasEvaluation ? applicant.matchScore : null);
        const isRowEvaluating = evaluatingPipelineId === applicant.id;

        return (
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
                            <p className="font-semibold flex items-center gap-2 flex-wrap">
                                {applicant.name}
                                {!applicant.resumeUrl && (
                                    <Badge variant="outline" className="text-xs font-normal">No resume</Badge>
                                )}
                                {applicant.evaluationRank != null && (
                                    <Badge variant="secondary" className="text-xs">Rank #{applicant.evaluationRank}</Badge>
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground">{applicant.email}</p>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${!applicant.hasEvaluation ? 'text-muted-foreground' : ''}`}>
                            {scoreLabel}
                        </span>
                        {applicant.hasEvaluation && (
                            <Progress
                                value={progressValue}
                                className="h-2 w-[100px] bg-slate-200"
                                indicatorClassName={getScoreColor(applicant.matchScore)}
                            />
                        )}
                        {isRowEvaluating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                </TableCell>
                {!isGrouped && (
                    <TableCell>
                        <Badge
                            variant={statusVariantMap[applicant.status] || 'secondary'}
                            className={`${statusClassMap[applicant.status]} hover:${statusClassMap[applicant.status]}`}
                        >
                            {getStageLabel(applicant.status)}
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
                                    {activeHiringStages.filter(s => s !== applicant.status).map(s => (
                                        <DropdownMenuItem key={s} onSelect={() => handleStageChangeClick(applicant, s)}>
                                            {getStageLabel(s)}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </TableCell>
            </TableRow>
            {applicant.summary && (
                <TableRow className="group-hover:bg-transparent">
                    <TableCell colSpan={isGrouped ? 4 : 5} className="py-2 px-4 pt-0 pl-16">
                        <p className="text-sm text-muted-foreground">{applicant.summary}</p>
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Job Post</p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold font-headline">{job.title}</h1>
                        <Badge
                            variant="secondary"
                            className={`capitalize font-bold text-xs px-2.5 py-0.5 border ${job.status === 'open' ? 'bg-green-50 text-green-700 border-green-200' :
                                job.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                        >
                            {job.status}
                        </Badge>
                    </div>
                </div>
                <div className='flex gap-2'>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    {canRunAiEvaluation && (
                        <Button
                            variant="outline"
                            onClick={() => void handleEvaluateAll()}
                            disabled={!canBatchEvaluate || isBatchEvaluating || evaluatingPipelineId !== null}
                            title={
                                !jobIsOpen
                                    ? 'Batch evaluation is only available for open jobs'
                                    : applicants.length === 0
                                      ? 'Add candidates before batch evaluation'
                                      : !hasJobSkillWeights
                                        ? 'Add skill weights on the job before batch AI evaluation'
                                        : evaluatingPipelineId
                                          ? 'Wait for the current evaluation to finish'
                                          : undefined
                            }
                        >
                            {isBatchEvaluating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Evaluate all
                        </Button>
                    )}
                    {canShareLinkedIn && (
                        <Button onClick={handlePostToLinkedIn}>
                            <Linkedin className="mr-2 h-4 w-4" />
                            Share to LinkedIn
                        </Button>
                    )}
                    {canManageJob && (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" disabled={isClosingJob}>
                                        {isClosingJob && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Actions
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {job.status !== 'closed' ? (
                                        <>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => setIsEditJobDialogOpen(true)}
                                            >
                                                <FileEdit className="mr-2 h-4 w-4" />
                                                Edit Job
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={openCustomizeFlowDialog}
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                Customize Flow
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                onClick={handleCloseJob}
                                                disabled={isClosingJob}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Close Job
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <DropdownMenuItem disabled className="text-muted-foreground">
                                            Job is Closed
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {!canShareLinkedIn ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
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
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button variant="outline" onClick={handleShareJob}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Copy link
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <LinkedInShareModal
                open={isLinkedInDialogOpen}
                onOpenChange={setIsLinkedInDialogOpen}
                jobId={job.id}
            />

            {canRunAiEvaluation && !hasJobSkillWeights && (
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="py-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-900">Skill weights required for AI evaluation</p>
                            <p className="text-sm text-amber-800/90 mt-1">
                                Add skill priorities to this job posting before using Evaluate with AI or Evaluate all.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {canRunAiEvaluation && hasJobSkillWeights && !jobIsOpen && (
                <Card className="border-slate-200 bg-slate-50/50">
                    <CardContent className="py-4 flex items-start gap-3">
                        <Info className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">
                            This job is <span className="font-semibold capitalize">{job.status}</span>. AI evaluation is only available while the job is open.
                        </p>
                    </CardContent>
                </Card>
            )}

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
                                {activeHiringStages.map(stage => (
                                    <SelectItem key={stage} value={stage}>{getStageLabel(stage)}</SelectItem>
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
                {applicants.length === 0 && (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-12 flex flex-col items-center text-center gap-2">
                            <Users className="h-10 w-10 text-muted-foreground opacity-60" />
                            <h3 className="font-semibold text-lg">No candidates in this job</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Add applicants to the pipeline to run AI evaluation, compare candidates, and move them through hiring stages.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {applicants.length > 0 && isGrouped && groupedApplicants && activeHiringStages.map(stage => {
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
                                                className={`${statusClassMap[stage]} text-base hover:${statusClassMap[stage]}`}
                                            >
                                                {getStageLabel(stage)}
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

                {applicants.length > 0 && !isGrouped && (
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
                                {filteredApplicants.length === 0 && (
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No applicants match your filters. Try clearing search or filters.
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                )}
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>


            <EditJobDialog
                open={isEditJobDialogOpen}
                onOpenChange={setIsEditJobDialogOpen}
                job={job}
                onSaved={loadData}
            />

            <Dialog open={isCustomizeFlowDialogOpen} onOpenChange={setIsCustomizeFlowDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                            <Settings className="h-6 w-6 text-primary" />
                            Customize Hiring Pipeline Flow
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">
                            Tailor the recruitment stages for this specific job. Rename stages, toggle middle rounds, and drag or reorder the timeline. Candidates will see this customized roadmap.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto min-h-0 my-4 pr-3">
                        <div className="space-y-4 py-2">


                            <div className=" ml-2">
                                <h3 className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-5 ml-1">Active Pipeline Flow</h3>
                                <div className="space-y-0 relative">
                                    {(() => {
                                        const visibleCount = flowStages.filter((s) => s.stage !== 'rejected').length;
                                        let displayNumber = 0;

                                        return flowStages.map((stageItem, index) => {
                                            if (stageItem.stage === 'rejected') return null;

                                            displayNumber += 1;
                                            const rejectedStage = flowStages.find((s) => s.stage === 'rejected');
                                            const isOutcomeStage = stageItem.stage === 'hired' && Boolean(rejectedStage);
                                            const isFirst = index === 0;
                                            const isLocked = isFirst || isOutcomeStage;
                                            const isLastVisible = displayNumber === visibleCount;
                                            const outcomeLabel = isOutcomeStage
                                                ? `${stageItem.label} / ${rejectedStage!.label}`
                                                : stageItem.label;

                                            return (
                                            <div
                                                key={stageItem.stage}
                                                className="relative flex items-stretch gap-4 pb-6 group"
                                            >
                                                {/* Left Side: Connecting Timeline & Circle */}
                                                <div className="flex flex-col items-center w-9 shrink-0 relative mt-1">
                                                    <div className={`flex items-center justify-center h-9 w-9 rounded-full font-bold text-xs shadow-sm z-10 ${isLocked ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-primary text-primary-foreground'}`}>
                                                        {displayNumber}
                                                    </div>
                                                    {!isLastVisible && (
                                                        <div className="absolute top-9 bottom-[-1.5rem] w-[2px] bg-slate-200 z-0" />
                                                    )}
                                                </div>

                                                {/* Right Side: The Content Card */}
                                                <div className={`flex-1 flex items-center gap-3 p-3 rounded-xl border transition-all bg-white shadow-sm hover:shadow-md hover:border-primary/40`}>

                                                    {/* Re-order arrows */}
                                                    <div className="flex flex-col items-center justify-center w-6 shrink-0">
                                                        {!isLocked ? (
                                                            <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    className="h-6 w-6 rounded hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent"
                                                                    disabled={index === 1}
                                                                    onClick={() => handleMoveStage(index, 'up')}
                                                                    title="Move Up"
                                                                >
                                                                    <ArrowUp className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="h-6 w-6 rounded hover:bg-slate-100 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent"
                                                                    disabled={index === flowStages.length - 3}
                                                                    onClick={() => handleMoveStage(index, 'down')}
                                                                    title="Move Down"
                                                                >
                                                                    <ArrowDown className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <Lock className="h-4 w-4 text-slate-300" />
                                                        )}
                                                    </div>

                                                    {/* Inputs */}
                                                    <div className="flex-1 grid gap-0.5 ml-1">
                                                        {isOutcomeStage && (
                                                            <Label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                                                                Final outcome: hired or rejected
                                                            </Label>
                                                        )}
                                                        {isOutcomeStage ? (
                                                            <p className="px-2 -ml-2 text-base font-semibold text-foreground">
                                                                {outcomeLabel}
                                                            </p>
                                                        ) : (
                                                            <Input
                                                                value={stageItem.label}
                                                                onChange={(e) => handleRenameStage(index, e.target.value)}
                                                                placeholder="Stage Name"
                                                                className="h-8 font-semibold text-base border-transparent hover:border-input focus:border-primary bg-transparent px-2 -ml-2 shadow-none transition-colors"
                                                            />
                                                        )}
                                                        {isOutcomeStage && (
                                                            <p className="px-2 -ml-2 text-xs text-muted-foreground">
                                                                Candidates end here as either hired or rejected — not as sequential steps.
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Delete and Lock Action */}
                                                    {!isLocked && (
                                                        <div className="flex items-center gap-2 pl-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                                onClick={() => handleDeleteStage(index)}
                                                                title="Delete Stage"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {isLocked && (
                                                        <div className="text-xs text-muted-foreground/60 font-semibold px-3 py-1 bg-slate-50 border rounded-full">
                                                            Locked
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-1 py-3 border-t bg-slate-50/50">
                        <button
                            type="button"
                            onClick={handleAddStage}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors font-semibold"
                        >
                            <Plus className="h-5 w-5" />
                            Add Custom Stage
                        </button>
                    </div>

                    <DialogFooter className="pt-4 border-t gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsCustomizeFlowDialogOpen(false)}
                            disabled={isSavingFlow}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveFlow}
                            disabled={isSavingFlow}
                            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6"
                        >
                            {isSavingFlow ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Flow...
                                </>
                            ) : (
                                'Save Configuration'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isStageChangeDialogOpen} onOpenChange={handleStageChangeDialogClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change applicant stage</AlertDialogTitle>
                        <AlertDialogDescription>
                            Move <span className='font-bold'>{selectedApplicant?.name}</span> to the <span className='font-bold'>{getStageLabel(selectedStage)}</span> stage. You can add an optional note below.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="stage-change-note" className="font-semibold">Add a note (optional)</Label>
                        <Textarea
                            id="stage-change-note"
                            placeholder={`Reason for moving to ${getStageLabel(selectedStage)}...`}
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
                                                <CalendarPlus className="mr-2 h-4 w-4" />
                                                Schedule Interview
                                            </Button>
                                            {canRunAiEvaluation && (
                                                <Button
                                                    variant="outline"
                                                    className="mt-2 w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                                    onClick={() => void handleAIEvaluate(selectedApplicant.id)}
                                                    disabled={Boolean(getAiEvaluateDisabledReason(selectedApplicant)) || evaluatingPipelineId === selectedApplicant.id}
                                                    title={getAiEvaluateDisabledReason(selectedApplicant)}
                                                >
                                                    {evaluatingPipelineId === selectedApplicant.id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                    )}
                                                    {selectedApplicant.hasEvaluation
                                                        ? 'Re-Evaluate with AI'
                                                        : 'Evaluate with AI'}
                                                </Button>
                                            )}
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
                                                        {activeHiringStages.filter(s => s !== selectedApplicant.status).map(s => (
                                                            <DropdownMenuItem key={s} onSelect={() => handleStageChangeClick(selectedApplicant, s)}>
                                                                {getStageLabel(s)}
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
                                                <CardTitle className='flex items-center justify-between flex-wrap gap-2'>
                                                    <span>AI Match Score</span>
                                                    <span className={`font-bold text-2xl ${selectedApplicant.hasEvaluation ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        {formatMatchScoreLabel(
                                                            !!selectedApplicant.hasEvaluation,
                                                            selectedApplicant.hasEvaluation ? selectedApplicant.matchScore : null,
                                                        )}
                                                    </span>
                                                </CardTitle>
                                                <CardDescription>
                                                    {selectedApplicant.hasEvaluation
                                                        ? 'Based on resume and job description.'
                                                        : 'Run AI evaluation to generate a match score and breakdown.'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedApplicant.hasEvaluation && (
                                                    <Progress
                                                        value={getMatchScoreProgress(true, selectedApplicant.matchScore)}
                                                        className="h-3"
                                                        indicatorClassName={getScoreColor(selectedApplicant.matchScore)}
                                                    />
                                                )}
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
                                                            <span>
                                                                {selectedApplicant.riskFlags
                                                                    ? 'See details below'
                                                                    : selectedApplicant.hasEvaluation
                                                                      ? 'None noted'
                                                                      : '--'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Application Summary</CardTitle>
                                                <CardDescription>A TLDR of the candidate&apos;s profile, generated by AI.</CardDescription>
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
                                                <CardTitle className="flex items-center gap-2">
                                                    <MessageSquareQuote className="h-5 w-5 text-primary" />
                                                    <span>Suggested Interview Questions</span>
                                                </CardTitle>
                                                <CardDescription>
                                                    AI-generated questions appear after evaluation.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedApplicant.interviewQuestions && selectedApplicant.interviewQuestions.length > 0 ? (
                                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-2">
                                                        {selectedApplicant.interviewQuestions.map((q, i) => (
                                                            <li key={i}>{q}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic text-center py-2">
                                                        No suggested questions yet. Run AI evaluation first.
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {applicantInterview && (
                                            <Card className="border-primary/20 bg-primary/5">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <BrainCircuit className="h-5 w-5 text-primary" />
                                                        <span>AI Interview Intelligence</span>
                                                    </CardTitle>
                                                    <CardDescription>Comprehensive analysis of the candidate&apos;s last interview performance.</CardDescription>
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
                                                                &quot;{applicantInterview.aiAnalysis?.recommendation}&quot;
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
                                                        {(selectedApplicant.notes || []).map((note, index) => (
                                                            <div key={index} className="border-l-2 border-slate-200 pl-3 text-sm">
                                                                <p className="font-semibold">{note.author} <span className="text-muted-foreground font-normal">- {note.date}</span></p>
                                                                <p className="text-muted-foreground italic">&quot;{note.note}&quot;</p>
                                                            </div>
                                                        ))}
                                                        {(!selectedApplicant.notes || selectedApplicant.notes.length === 0) && (
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
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`font-bold text-lg ${!candidate.hasEvaluation ? 'text-muted-foreground' : ''}`}>
                                                    {formatMatchScoreLabel(
                                                        !!candidate.hasEvaluation,
                                                        candidate.hasEvaluation ? candidate.matchScore : null,
                                                    )}
                                                </span>
                                                {candidate.evaluationRank != null && (
                                                    <Badge variant="secondary" className="text-xs">Rank #{candidate.evaluationRank}</Badge>
                                                )}
                                                {candidate.hasEvaluation && (
                                                    <Progress
                                                        value={getMatchScoreProgress(true, candidate.matchScore)}
                                                        className="h-2 w-[100px] bg-slate-200"
                                                        indicatorClassName={getScoreColor(candidate.matchScore)}
                                                    />
                                                )}
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
                                                {(candidate.notes || []).map((note, index) => (
                                                    <div key={index} className="border-l-2 border-slate-200 pl-3 text-xs">
                                                        <p className="font-semibold">{note.author} <span className="text-muted-foreground font-normal">- {note.date}</span></p>
                                                        <p className="text-muted-foreground italic">&quot;{note.note}&quot;</p>
                                                    </div>
                                                ))}
                                                {(!candidate.notes || candidate.notes.length === 0) && (
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
