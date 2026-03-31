
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Bot, Pencil, ChevronDown, Send, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { jobs as initialJobs } from '@/lib/jobs-data';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/types';
import { cn } from '@/lib/utils';


export default function JobPostingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState(initialJobs);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [view, setView] = useState<'open' | 'draft'>('open');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formState, setFormState] = useState({ title: '', location: '', description: '' });

  useEffect(() => {
    if (editingJob) {
      setFormState({
        title: editingJob.title,
        location: editingJob.location,
        description: editingJob.description,
      });
    } else {
      setFormState({ title: '', location: '', description: '' });
    }
  }, [editingJob]);

  const displayedJobs = jobs.filter(j => j.status === view);

  const handleOpenDialog = (job: Job | null) => {
    setEditingJob(job);
    setIsManualDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsManualDialogOpen(false);
    setEditingJob(null);
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleJobSave = (status: 'open' | 'draft') => {
    if (!formState.title || !formState.location || !formState.description) {
        toast({ title: 'Missing Fields', description: 'Please fill out all fields.', variant: 'destructive' });
        return;
    }

    if (editingJob) {
        // Update existing job
        setJobs(prevJobs => prevJobs.map(job =>
            job.id === editingJob.id
                ? { ...job, ...formState, status, postedAt: status === 'open' ? new Date() : job.postedAt }
                : job
        ));
        toast({
            title: status === 'open' ? "Job Published!" : "Draft Updated!",
            description: `The job "${formState.title}" has been updated.`,
        });
    } else {
        // Create new job
        const newJob: Job = {
            id: `job-${Date.now()}`,
            title: formState.title,
            location: formState.location,
            description: formState.description,
            fullDescription: formState.description,
            company: 'Your Company',
            postedAt: new Date(),
            status,
            recruiterId: 'current-user',
            applicantCount: 0,
        };
        setJobs(prevJobs => [newJob, ...prevJobs]);
        toast({
            title: status === 'open' ? "Job Posted!" : "Draft Saved!",
            description: `The job "${formState.title}" has been saved.`,
        });
    }

    handleCloseDialog();
  }
  
  const handlePublishDraft = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? {...j, status: 'open', postedAt: new Date()} : j));
    toast({ title: 'Job Published!', description: 'The job is now live for applicants.'});
  };

  const handleDeleteDraft = () => {
    if (!jobToDelete) return;
    setJobs(prev => prev.filter(j => j.id !== jobToDelete.id));
    toast({
      title: 'Draft Deleted',
      description: `The draft "${jobToDelete.title}" has been deleted.`,
      variant: 'destructive'
    });
    setJobToDelete(null);
  };

  const statusVariantMap: { [key: string]: string } = {
    open: 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
    draft: 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30'
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Job Postings</h1>
          <p className="text-muted-foreground">Create, view, and manage your company's job openings.</p>
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
                "rounded-none rounded-t-md border-b-2",
                view === 'open' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            )}
        >
            Open Postings
        </Button>
        <Button
            variant="ghost"
            onClick={() => setView('draft')}
             className={cn(
                "rounded-none rounded-t-md border-b-2",
                view === 'draft' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
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
                {displayedJobs.map((job) => (
                    <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.status === 'open' ? job.applicantCount : '—'}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className={`${statusVariantMap[job.status]} capitalize`}>
                        {job.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {job.status === 'open' ? (
                            <Button asChild variant="outline" size="sm">
                            <Link href={`/job-postings/${job.id}`}>View Applicants<ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        ) : (
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(job)}>
                                    <Edit className="mr-2 h-4 w-4"/> Edit
                                </Button>
                                <Button size="sm" onClick={() => handlePublishDraft(job.id)}>
                                    <Send className="mr-2 h-4 w-4"/> Publish
                                </Button>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setJobToDelete(job)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </AlertDialogTrigger>
                            </div>
                        )}
                    </TableCell>
                    </TableRow>
                ))}
                {displayedJobs.length === 0 && (
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the draft for "{jobToDelete?.title}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDraft} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isManualDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>{editingJob ? 'Edit Job Draft' : 'Create Job Manually'}</DialogTitle>
                <DialogDescription>
                    {editingJob ? 'Update the details for this job draft.' : 'Fill in the details below to post a new job.'}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Job Title</Label>
                    <Input id="title" name="title" className="col-span-3" value={formState.title} onChange={handleFormChange} required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Location</Label>
                    <Input id="location" name="location" className="col-span-3" value={formState.location} onChange={handleFormChange} required />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">Description</Label>
                    <Textarea id="description" name="description" className="col-span-3 min-h-[250px]" value={formState.description} onChange={handleFormChange} required />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={handleCloseDialog}>Cancel</Button>
                <Button type="button" variant="outline" onClick={() => handleJobSave('draft')}>{editingJob ? 'Save Changes' : 'Save as Draft'}</Button>
                <Button type="button" onClick={() => handleJobSave('open')}>{editingJob ? 'Save & Publish' : 'Save & Post Job'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
