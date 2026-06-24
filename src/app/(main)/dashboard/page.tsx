'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck2, Clock, CalendarCheck2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { CompanyPostedJobsDashboard } from '@/components/company-posted-jobs-dashboard';
import { useMyApplications } from '@/hooks/use-portal';

function RecruiterDashboard() {
  return (
    <CompanyPostedJobsDashboard
      title="Dashboard"
      subtitle="Your company’s published job openings."
      jdCreateHref="/jd-builder"
    />
  );
}

function CandidateDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useMyApplications({ page: 1, limit: 100 }, { enabled: !!user });
  const applications = data?.items ?? [];

  // Derived counts
  const submittedCount = applications.length;
  const inProgressCount = applications.filter(app => 
    !['rejected', 'hired', 'offer'].includes(app.stage)
  ).length;
  const interviewsCount = applications.filter(app => 
    ['technical_interview', 'hr_interview'].includes(app.stage)
  ).length;

  const statusVariantMap: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
    screening: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
    technical_interview: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200',
    hr_interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200',
    offer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200',
    hired: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200',
  };

  const latestApps = applications.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name?.split(' ')[0] ?? 'there'}!</h1>
            <p className="text-muted-foreground">Manage your profile and track your applications.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">Profile</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{submittedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {submittedCount === 0 ? 'No applications yet.' : `Active job applications.`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{inProgressCount}</div>
                <p className="text-xs text-muted-foreground">
                  {inProgressCount === 0 ? 'Nothing in progress.' : `${inProgressCount} active reviews.`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{interviewsCount}</div>
                <p className="text-xs text-muted-foreground">
                  {interviewsCount === 0 ? 'No interviews scheduled.' : `${interviewsCount} interviews pending.`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Your latest applications will appear here.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/find-jobs">Find Jobs</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/my-applications">View All</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : latestApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No applications yet. Go to{' '}
                    <Link className="underline" href="/find-jobs">
                      Find Jobs
                    </Link>{' '}
                    to apply.
                  </TableCell>
                </TableRow>
              ) : (
                latestApps.map((app) => (
                  <TableRow key={app.pipelineId}>
                    <TableCell className="font-medium">
                      <Link href={`/my-applications/${app.pipelineId}`} className="hover:underline text-primary">
                        {app.job.title}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {app.job.companyName || app.job.company || app.job.tenant?.name || 'Company'}
                    </TableCell>
                    <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusVariantMap[app.stage] || ''} capitalize`}>
                        {app.stage.replace('_', ' ')}
                      </Badge>
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

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'recruiter') {
    return <RecruiterDashboard />;
  }

  if (user?.role === 'candidate') {
    return <CandidateDashboard />;
  }

  return null;
}
