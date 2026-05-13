'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Bot, Pencil, ChevronDown, Send, Trash2, Edit, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { CreatedJob, SkillWeight } from '@/lib/stage1-2-api';
import { jobsApi } from '@/lib/stage1-2-api';

function mapApiJobToRow(j: CreatedJob): Job {
  const backend = j.status as Job['backendStatus'];
  const uiStatus: Job['status'] =
    j.status === 'draft' ? 'draft' : j.status === 'closed' ? 'closed' : 'open';

  const weights = j.skillWeights;
  const skillWeights =
    Array.isArray(weights) && weights.length > 0
      ? weights.map((w) => ({
          skill: String(w.skill ?? '').trim(),
          weight: Math.min(10, Math.max(0, Math.round(Number(w.weight)))),
        }))
      : undefined;

  return {
    id: j.id,
    title: j.title,
    description: j.description,
    fullDescription: j.requirements ?? j.description,
    company: '',
    location: j.location?.trim() ? j.location : '—',
    department: j.department ?? '',
    postedAt: j.createdAt ? new Date(j.createdAt) : new Date(),
    status: uiStatus,
    backendStatus: backend ?? undefined,
    recruiterId: '',
    applicantCount: 0,
    skillWeights: skillWeights?.filter((s) => s.skill.length > 0),
  };
}

export default function JobPostingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [view, setView] = useState<'open' | 'draft'>('open');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formState, setFormState] = useState<{
    title: string;
    location: string;
    description: string;
    skillWeights: SkillWeight[];
  }>({ title: '', location: '', description: '', skillWeights: [] });
  const [loadingJobDetail, setLoadingJobDetail] = useState(false);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await jobsApi.list({ page: 1, limit: 100 });
      setJobs((res.items ?? []).map(mapApiJobToRow));
    } catch (error) {
      toast({
        title: 'Unable to load jobs',
        description: error instanceof Error ? error.message : 'Please sign in as a company user and try again.',
        variant: 'destructive',
      });
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (editingJob) {
      setFormState({
        title: editingJob.title,
        location: editingJob.location === '—' ? '' : editingJob.location,
        description: editingJob.description,
        skillWeights:
          editingJob.skillWeights && editingJob.skillWeights.length > 0
            ? editingJob.skillWeights.map((s) => ({
                skill: s.skill,
                weight: Math.min(10, Math.max(0, Math.round(s.weight))),
              }))
            : [],
      });
    } else {
      setFormState({ title: '', location: '', description: '', skillWeights: [] });
    }
  }, [editingJob]);

  const normalizedSkillWeights = (): SkillWeight[] =>
    formState.skillWeights
      .map((row) => ({
        skill: row.skill.trim(),
        weight: Math.min(10, Math.max(0, Math.round(Number(row.weight)) || 0)),
      }))
      .filter((row) => row.skill.length > 0);

  const displayedJobs = jobs.filter((j) => {
    if (view === 'open') {
      return j.status === 'open';
    }
    return j.status === 'draft';
  });

  const handleOpenDialog = (job: Job | null) => {
    if (!job) {
      setEditingJob(null);
      setIsManualDialogOpen(true);
      return;
    }
    setLoadingJobDetail(true);
    void (async () => {
      try {
        const full = await jobsApi.get(job.id);
        setEditingJob(mapApiJobToRow(full));
        setIsManualDialogOpen(true);
      } catch (error) {
        toast({
          title: 'Could not load job details',
          description: error instanceof Error ? error.message : 'Try again.',
          variant: 'destructive',
        });
        setEditingJob(job);
        setIsManualDialogOpen(true);
      } finally {
        setLoadingJobDetail(false);
      }
    })();
  };

  const handleCloseDialog = (open?: boolean) => {
    if (open === true) return;
    setIsManualDialogOpen(false);
    setEditingJob(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateSkillRow = (index: number, patch: Partial<SkillWeight>) => {
    setFormState((prev) => ({
      ...prev,
      skillWeights: prev.skillWeights.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  };

  const addSkillRow = () => {
    setFormState((prev) => ({
      ...prev,
      skillWeights: [...prev.skillWeights, { skill: '', weight: 7 }],
    }));
  };

  const removeSkillRow = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      skillWeights: prev.skillWeights.filter((_, i) => i !== index),
    }));
  };

  const handleJobSave = async (status: 'open' | 'draft') => {
    const title = formState.title.trim();
    const location = formState.location.trim();
    const description = formState.description.trim();

    if (!title || !location || !description) {
      toast({ title: 'Missing fields', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }
    if (description.length < 10) {
      toast({
        title: 'Description too short',
        description: 'Use at least 10 characters for the job description.',
        variant: 'destructive',
      });
      return;
    }

    if (editingJob?.backendStatus === 'open' && status === 'draft') {
      toast({
        title: 'Not supported',
        description: 'Published jobs cannot be turned into drafts from here.',
        variant: 'destructive',
      });
      return;
    }

    const skillWeightsPayload = normalizedSkillWeights();

    setIsSaving(true);
    try {
      if (editingJob) {
        await jobsApi.update(editingJob.id, {
          title,
          description: description.slice(0, 5000),
          location: location || undefined,
          skillWeights: skillWeightsPayload,
        });
        if (status === 'open' && editingJob.backendStatus === 'draft') {
          await jobsApi.publish(editingJob.id);
        }
        toast({
          title: status === 'open' ? 'Job published' : 'Draft saved',
          description: `"${title}" has been updated.`,
        });
      } else {
        const created = await jobsApi.create({
          title,
          description: description.slice(0, 5000),
          location: location || undefined,
          skillWeights: skillWeightsPayload.length > 0 ? skillWeightsPayload : undefined,
        });
        if (status === 'open') {
          await jobsApi.publish(created.id);
        }
        toast({
          title: status === 'open' ? 'Job posted' : 'Draft saved',
          description: `"${title}" has been saved.`,
        });
      }
      await loadJobs();
      setIsManualDialogOpen(false);
      setEditingJob(null);
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishDraft = async (jobId: string) => {
    setPublishingId(jobId);
    try {
      await jobsApi.publish(jobId);
      toast({ title: 'Job published', description: 'The job is now live for applicants.' });
      await loadJobs();
    } catch (error) {
      toast({
        title: 'Publish failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteDraft = async () => {
    if (!jobToDelete) return;
    try {
      await jobsApi.delete(jobToDelete.id);
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      toast({ title: 'Draft deleted', description: `"${jobToDelete.title}" has been deleted.` });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setJobToDelete(null);
    }
  };

  const statusVariantMap: { [key: string]: string } = {
    open: 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
    draft: 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30',
    closed: 'bg-muted text-muted-foreground',
  };

  const statusLabel = (job: Job) => {
    if (job.backendStatus === 'paused') return 'paused';
    return job.status;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Job Postings</h1>
          <p className="text-muted-foreground">Create, view, and manage your company&apos;s job openings.</p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Create New Job <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuItem onSelect={() => router.push('/jd-builder')}>
                <Bot className="mr-2 h-4 w-4" /> Use AI Assistant
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleOpenDialog(null)}>
                <Pencil className="mr-2 h-4 w-4" /> Create Manually
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b">
        <Button
          variant="ghost"
          onClick={() => setView('open')}
          className={cn(
            'rounded-none rounded-t-md border-b-2',
            view === 'open' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground',
          )}
        >
          Open Postings
        </Button>
        <Button
          variant="ghost"
          onClick={() => setView('draft')}
          className={cn(
            'rounded-none rounded-t-md border-b-2',
            view === 'draft' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground',
          )}
        >
          Drafts
        </Button>
      </div>

      <AlertDialog>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs…
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.status === 'open' ? job.applicantCount : '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${statusVariantMap[job.status] ?? ''} capitalize`}
                        >
                          {statusLabel(job)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {job.status === 'open' ? (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/job-postings/${job.id}`}>
                              View Applicants
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(job)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              disabled={publishingId === job.id}
                              onClick={() => void handlePublishDraft(job.id)}
                            >
                              {publishingId === job.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="mr-2 h-4 w-4" />
                              )}
                              Publish
                            </Button>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setJobToDelete(job)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!isLoading && displayedJobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No {view} jobs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{jobToDelete ? ` "${jobToDelete.title}"` : ' this draft'}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDeleteDraft()} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isManualDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job Draft' : 'Create Job Manually'}</DialogTitle>
            <DialogDescription>
              {editingJob
                ? 'Update the details for this job draft.'
                : 'Fill in the details below to post a new job.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Job Title
              </Label>
              <Input
                id="title"
                name="title"
                className="col-span-3"
                value={formState.title}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                className="col-span-3"
                value={formState.location}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                className="col-span-3 min-h-[250px]"
                value={formState.description}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Skill weights</Label>
              <div className="col-span-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Used by AI resume scoring (0–10 per skill). Optional but recommended for evaluations.
                </p>
                {formState.skillWeights.map((row, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    <Input
                      className="min-w-[140px] flex-1"
                      placeholder="e.g. React"
                      value={row.skill}
                      onChange={(e) => updateSkillRow(index, { skill: e.target.value })}
                      aria-label={`Skill ${index + 1}`}
                    />
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={1}
                      className="w-20"
                      value={row.weight}
                      onChange={(e) =>
                        updateSkillRow(index, { weight: Number.parseInt(e.target.value, 10) || 0 })
                      }
                      aria-label={`Weight for skill ${index + 1}`}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSkillRow(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSkillRow}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add skill
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleCloseDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving || loadingJobDetail}
              onClick={() => void handleJobSave('draft')}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingJob ? 'Save Changes' : 'Save as Draft'}
            </Button>
            <Button type="button" disabled={isSaving || loadingJobDetail} onClick={() => void handleJobSave('open')}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingJob ? 'Save & Publish' : 'Save & Post Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
