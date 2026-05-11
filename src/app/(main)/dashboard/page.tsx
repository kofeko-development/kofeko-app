'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileCheck2, Clock, CalendarCheck2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { CompanyPostedJobsDashboard } from '@/components/company-posted-jobs-dashboard';

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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No applications yet.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Nothing in progress.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No interviews scheduled.</p>
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
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No applications yet. Go to{' '}
                  <Link className="underline" href="/find-jobs">
                    Find Jobs
                  </Link>{' '}
                  to apply.
                </TableCell>
              </TableRow>
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
