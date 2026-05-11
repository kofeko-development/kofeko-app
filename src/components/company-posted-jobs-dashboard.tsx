'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { jobsApi, type CreatedJob } from '@/lib/stage1-2-api';

export type CompanyPostedJobsDashboardProps = {
  title: string;
  subtitle: string;
  /** Link shown in the empty state for creating a JD (e.g. `/jd-builder` or `/admin/jd-creator`). */
  jdCreateHref?: string;
};

function statusLabel(s: string) {
  if (s === 'open') return 'Live';
  if (s === 'paused') return 'Paused';
  if (s === 'draft') return 'Draft';
  if (s === 'closed') return 'Closed';
  return s;
}

export function CompanyPostedJobsDashboard({
  title,
  subtitle,
  jdCreateHref = '/jd-builder',
}: CompanyPostedJobsDashboardProps) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CreatedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await jobsApi.list({ page: 1, limit: 100 });
      setJobs(res.items ?? []);
    } catch (error) {
      toast({
        title: 'Unable to load jobs',
        description: error instanceof Error ? error.message : 'Please try again.',
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

  const postedJobs = jobs.filter((j) => j.status === 'open' || j.status === 'paused');
  const postedCount = postedJobs.length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:max-w-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs posted</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : postedCount}</div>
            <p className="text-xs text-muted-foreground">
              Live or paused roles for your company (same list candidates can discover when published).
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Posted jobs</CardTitle>
            <CardDescription>
              Roles your team has published. Drafts stay under Job Postings until you publish them.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/job-postings">
              Manage jobs
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading jobs…
                    </span>
                  </TableCell>
                </TableRow>
              ) : postedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No posted jobs yet. Use{' '}
                    <Link className="underline font-medium text-foreground" href={jdCreateHref}>
                      JD Creator
                    </Link>{' '}
                    or{' '}
                    <Link className="underline font-medium text-foreground" href="/job-postings">
                      Job Postings
                    </Link>{' '}
                    to publish a role.
                  </TableCell>
                </TableRow>
              ) : (
                postedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell className="text-muted-foreground">{job.location?.trim() || '—'}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{statusLabel(job.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/job-postings/${job.id}`}>
                          View
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
