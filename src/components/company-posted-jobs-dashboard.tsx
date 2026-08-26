'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Briefcase, FilePlus, UserCheck, Users, MoreHorizontal, FileText, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useJobsList } from '@/hooks/use-jobs';
import { useAuth } from '@/lib/auth';
import { TableRowsSkeleton } from '@/components/loading/table-rows-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export type CompanyPostedJobsDashboardProps = {
  title: string;
  subtitle: string;
  /** Link shown in the empty state for creating a JD (e.g. `/jd-builder` or `/admin/jd-creator`). */
  jdCreateHref?: string;
};

function StatusPill({ status }: { status: string }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Live
      </span>
    );
  }
  if (status === 'paused') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Paused
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      Closed
    </span>
  );
}

export function CompanyPostedJobsDashboard({
  title,
  subtitle,
  jdCreateHref = '/jd-builder',
}: CompanyPostedJobsDashboardProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const routePrefix = isAdmin ? '/admin' : '';
  const { user, loading: authLoading, hasPermission } = useAuth();
  const { data, isLoading } = useJobsList({ page: 1, limit: 100 }, { enabled: !authLoading && !!user });
  const jobs = data?.items ?? [];

  const postedJobs = jobs.filter((j) => j.status === 'open' || j.status === 'paused');
  const postedCount = postedJobs.length;
  
  // Note: assuming `applicantCount` exists on job in useJobsList result
  const totalApplicants = jobs.reduce((acc, job) => acc + ((job as any).applicantCount || 0), 0);
  const totalHired = jobs.reduce((acc, job) => acc + ((job as any).hiredCount || 0), 0);

  return (
    <div className="flex flex-col gap-10">
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 text-base">{subtitle}</p>
      </div>

      {/* Top Metric Cards (Alpha Inspiration) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Jobs */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">Jobs</h3>
            <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">
              Manage your active and paused roles across the company.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
            <Link href={`${routePrefix}/job-postings`} className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center group-hover:underline">
              Manage Jobs <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {isLoading ? <Skeleton className="h-6 w-8" /> : <span className="font-bold text-lg">{postedCount}</span>}
          </div>
        </div>

        {/* Card 2: Applicants */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">Candidates</h3>
            <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">
              Review applicants and track them through your pipeline.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
            <Link href={`${routePrefix}/applicants`} className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center group-hover:underline">
              View Candidates <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {isLoading ? <Skeleton className="h-6 w-8" /> : <span className="font-bold text-lg">{totalApplicants}</span>}
          </div>
        </div>

        {/* Card 3: Create JD */}
        {hasPermission('job:create') && (
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FilePlus className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">JD Creator</h3>
              <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">
                Generate rich, inclusive job descriptions using Kofeko AI.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
              <Link href={jdCreateHref} className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center group-hover:underline">
                Create new JD <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Card 4: Hires */}
        {hasPermission('candidate:read') && (
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Hires</h3>
              <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">
                Total candidates successfully hired across your organization.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
              <Link href={`${routePrefix}/applicants`} className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center group-hover:underline">
                View Hires <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              {isLoading ? <Skeleton className="h-6 w-8" /> : <span className="font-bold text-lg">{totalHired}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Jobs Table (Alpha Workflow style) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-headline tracking-tight text-foreground">Workflow</h2>
            <p className="text-sm text-muted-foreground mt-1">Recently posted jobs and active pipelines.</p>
          </div>
          {hasPermission('job:create') && (
            <Button asChild variant="default" className="rounded-full shadow-sm">
              <Link href={jdCreateHref}>
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Link>
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b-border/50">
                <TableHead className="font-medium text-muted-foreground h-11">Job Title</TableHead>
                <TableHead className="font-medium text-muted-foreground h-11">Location</TableHead>
                <TableHead className="font-medium text-muted-foreground h-11">Status</TableHead>
                <TableHead className="font-medium text-muted-foreground h-11">Posted Date</TableHead>
                <TableHead className="text-right font-medium text-muted-foreground h-11 w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} cols={5} />
              ) : postedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                      <FileText className="h-8 w-8 opacity-20" />
                      <p>No active workflows found.</p>
                      {hasPermission('job:create') && (
                        <Button asChild variant="link" size="sm" className="h-auto p-0">
                          <Link href={jdCreateHref}>Create your first job posting</Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                postedJobs.map((job) => (
                  <TableRow key={job.id} className="group hover:bg-muted/20 border-b-border/40 transition-colors">
                    <TableCell className="font-medium text-foreground py-3">
                      <Link href={`${routePrefix}/job-postings/${job.id}`} className="hover:underline hover:text-primary transition-colors block truncate max-w-[200px] lg:max-w-[300px]" title={job.title}>
                        {job.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3">{job.location?.trim() || 'Remote'}</TableCell>
                    <TableCell className="py-3">
                      <StatusPill status={job.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem asChild>
                            <Link href={`${routePrefix}/job-postings/${job.id}`}>View details</Link>
                          </DropdownMenuItem>
                          {hasPermission('job:update') && (
                            <DropdownMenuItem asChild>
                              <Link href={`${routePrefix}/job-postings/${job.id}/edit`}>Edit job</Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
