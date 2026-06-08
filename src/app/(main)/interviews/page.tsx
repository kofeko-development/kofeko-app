
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CalendarDays,
    Clock,
    Plus,
    Search,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Interview } from '@/lib/types';
import {
    jobsApi,
    pipelinesApi,
    type ApiPipeline,
    type CreatedJob,
} from '@/lib/stage1-2-api';

const ASSIGNED_INTERVIEWS_STORAGE_KEY = 'kofeko-assigned-interviews';

type AssignableApplicant = {
    candidateId: string;
    name: string;
    pipelineId: string;
};

function loadAssignedInterviews(): Interview[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(ASSIGNED_INTERVIEWS_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Interview[]) : [];
    } catch {
        return [];
    }
}

function pipelineToApplicant(pipeline: ApiPipeline): AssignableApplicant {
    return {
        candidateId: pipeline.candidateId,
        name: `${pipeline.candidate.firstName} ${pipeline.candidate.lastName}`.trim(),
        pipelineId: pipeline.id,
    };
}

function isFutureDateTime(date: string, time: string): boolean {
    if (!date || !time) return false;
    const scheduled = new Date(`${date}T${time}`);
    return !Number.isNaN(scheduled.getTime()) && scheduled.getTime() > Date.now();
}

export default function InterviewsPage() {
    const { toast } = useToast();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
    const [openJobs, setOpenJobs] = useState<CreatedJob[]>([]);
    const [jobApplicants, setJobApplicants] = useState<AssignableApplicant[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    const [newInterview, setNewInterview] = useState({
        applicantId: '',
        jobId: '',
        date: '',
        time: '',
    });

    const minDate = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        setInterviews(loadAssignedInterviews());
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(ASSIGNED_INTERVIEWS_STORAGE_KEY, JSON.stringify(interviews));
    }, [interviews]);

    const loadOpenJobs = useCallback(async () => {
        setLoadingJobs(true);
        try {
            const res = await jobsApi.list({ status: 'open', limit: 100 });
            setOpenJobs(res.items ?? []);
        } catch (error) {
            setOpenJobs([]);
            toast({
                title: 'Unable to load jobs',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoadingJobs(false);
        }
    }, [toast]);

    const loadApplicantsForJob = useCallback(async (jobId: string) => {
        if (!jobId) {
            setJobApplicants([]);
            return;
        }
        setLoadingApplicants(true);
        try {
            const res = await pipelinesApi.list({ jobId, limit: 100 });
            setJobApplicants((res.items ?? []).map(pipelineToApplicant));
        } catch (error) {
            setJobApplicants([]);
            toast({
                title: 'Unable to load applicants',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoadingApplicants(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!isScheduleOpen) return;
        void loadOpenJobs();
    }, [isScheduleOpen, loadOpenJobs]);

    useEffect(() => {
        if (!newInterview.jobId) {
            setJobApplicants([]);
            return;
        }
        void loadApplicantsForJob(newInterview.jobId);
    }, [newInterview.jobId, loadApplicantsForJob]);

    const upcomingInterviews = useMemo(() =>
        interviews.filter(i => i.status === 'scheduled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [interviews]);

    const pastInterviews = useMemo(() =>
        interviews.filter(i => i.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [interviews]);

    const filteredPastInterviews = useMemo(() => {
        const query = archiveSearchQuery.trim().toLowerCase();
        if (!query) return pastInterviews;

        return pastInterviews.filter((interview) => {
            const haystack = [
                interview.applicantName,
                interview.jobTitle,
                interview.interviewerName,
                format(new Date(interview.date), 'MMM do, yyyy'),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [archiveSearchQuery, pastInterviews]);

    const resetAssignForm = () => {
        setNewInterview({ applicantId: '', jobId: '', date: '', time: '' });
        setJobApplicants([]);
    };

    const handleScheduleOpenChange = (open: boolean) => {
        setIsScheduleOpen(open);
        if (!open) resetAssignForm();
    };

    const handleJobChange = (jobId: string) => {
        setNewInterview((prev) => ({ ...prev, jobId, applicantId: '' }));
    };

    const handleSchedule = (e: React.FormEvent) => {
        e.preventDefault();

        const job = openJobs.find((j) => j.id === newInterview.jobId);
        const applicant = jobApplicants.find((a) => a.candidateId === newInterview.applicantId);

        if (!job) {
            toast({ title: 'Select a job', description: 'Choose one of your open job postings.', variant: 'destructive' });
            return;
        }

        if (!applicant) {
            toast({
                title: 'Select an applicant',
                description: 'This job has no applicants yet. Add candidates from Job Postings first.',
                variant: 'destructive',
            });
            return;
        }

        if (!isFutureDateTime(newInterview.date, newInterview.time)) {
            toast({
                title: 'Invalid date or time',
                description: 'Interview must be scheduled for a future date and time.',
                variant: 'destructive',
            });
            return;
        }

        const scheduledAt = new Date(`${newInterview.date}T${newInterview.time}`);

        const scheduledInterview: Interview = {
            id: `int-${Date.now()}`,
            applicantId: applicant.candidateId,
            applicantName: applicant.name,
            jobId: job.id,
            jobTitle: job.title,
            interviewerId: 'current-user',
            interviewerName: 'You',
            date: scheduledAt.toISOString(),
            status: 'scheduled',
        };

        setInterviews([scheduledInterview, ...interviews]);
        resetAssignForm();
        setIsScheduleOpen(false);
        toast({
            title: 'Interview assigned',
            description: `${applicant.name} has been scheduled for ${job.title}.`,
        });
    };

    const canSubmitAssignment =
        Boolean(newInterview.jobId) &&
        Boolean(newInterview.applicantId) &&
        Boolean(newInterview.date) &&
        Boolean(newInterview.time) &&
        isFutureDateTime(newInterview.date, newInterview.time);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Interviews</h1>
                    <p className="text-muted-foreground">Assign interview slots to candidates on your open job postings. Live interviews and analysis are coming soon.</p>
                </div>
                <Dialog open={isScheduleOpen} onOpenChange={handleScheduleOpenChange}>
                    <DialogTrigger asChild>
                        <Button className="btn-gradient">
                            <Plus className="mr-2 h-4 w-4" /> Assign Interview
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign Interview</DialogTitle>
                            <DialogDescription>
                                Choose an open job posting, pick an applicant from that role, and set a future date and time.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSchedule} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Open job posting</Label>
                                <Select
                                    value={newInterview.jobId}
                                    onValueChange={handleJobChange}
                                    disabled={loadingJobs}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingJobs ? 'Loading jobs…' : 'Select open job posting'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {openJobs.length === 0 ? (
                                            <SelectItem value="__none__" disabled>
                                                No open job postings
                                            </SelectItem>
                                        ) : (
                                            openJobs.map((job) => (
                                                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {!loadingJobs && openJobs.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Publish a job under Job Postings before assigning interviews.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Applicant</Label>
                                <Select
                                    value={newInterview.applicantId}
                                    onValueChange={(val) => setNewInterview((prev) => ({ ...prev, applicantId: val }))}
                                    disabled={!newInterview.jobId || loadingApplicants}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                !newInterview.jobId
                                                    ? 'Select a job first'
                                                    : loadingApplicants
                                                        ? 'Loading applicants…'
                                                        : 'Select applicant'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobApplicants.length === 0 ? (
                                            <SelectItem value="__none__" disabled>
                                                No applicants for this job
                                            </SelectItem>
                                        ) : (
                                            jobApplicants.map((applicant) => (
                                                <SelectItem key={applicant.candidateId} value={applicant.candidateId}>
                                                    {applicant.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {newInterview.jobId && !loadingApplicants && jobApplicants.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        This job has no applicants yet. Candidates must apply or be added from Job Postings.
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        min={minDate}
                                        value={newInterview.date}
                                        onChange={(e) => setNewInterview((prev) => ({ ...prev, date: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input
                                        type="time"
                                        value={newInterview.time}
                                        onChange={(e) => setNewInterview((prev) => ({ ...prev, time: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            {newInterview.date && newInterview.time && !isFutureDateTime(newInterview.date, newInterview.time) && (
                                <p className="text-xs text-destructive">
                                    Interview date and time must be in the future.
                                </p>
                            )}
                            <DialogFooter>
                                <Button type="submit" className="w-full" disabled={!canSubmitAssignment || loadingJobs || loadingApplicants}>
                                    Assign Interview
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="archive">Past & Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {upcomingInterviews.map((int) => (
                            <Card key={int.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20">
                                        {int.jobTitle}
                                    </Badge>
                                    <CardTitle className="text-xl mt-2">{int.applicantName}</CardTitle>
                                    <CardDescription>Interviewer: {int.interviewerName}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        {format(new Date(int.date), 'EEEE, MMM do')}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                                        <Clock className="h-4 w-4" />
                                        {format(new Date(int.date), 'p')}
                                    </div>
                                    <p className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                                        Interview calls and join links are not available yet. Assignment only for now.
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                        {upcomingInterviews.length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold">No interviews assigned</h3>
                                <p className="text-muted-foreground">Use Assign Interview above once you have open jobs with applicants.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="archive" className="mt-6">
                    <Card>
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <CardTitle>Interview Archive</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search archives..."
                                        className="pl-8"
                                        value={archiveSearchQuery}
                                        onChange={(e) => setArchiveSearchQuery(e.target.value)}
                                        aria-label="Search interview archive"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Conducted On</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPastInterviews.map((int) => (
                                        <TableRow key={int.id}>
                                            <TableCell className="font-medium">{int.applicantName}</TableCell>
                                            <TableCell>{int.jobTitle}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(int.date), 'MMM do, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize">
                                                    {int.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredPastInterviews.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                {pastInterviews.length === 0
                                                    ? 'No completed interviews yet. Interview analysis will appear here once that feature is available.'
                                                    : 'No interviews match your search.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
