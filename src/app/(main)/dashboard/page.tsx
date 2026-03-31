
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Briefcase, Users, FileText, AlertTriangle, MessageSquareQuote } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from "@/lib/auth";
import { jobs } from "@/lib/jobs-data";
import { applicantsData } from "@/lib/data";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import React, { useMemo } from "react";
import { FileCheck2, Clock, CalendarCheck2 } from 'lucide-react';
import { format, subMonths } from 'date-fns';

const candidateApplications = [
    { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', appliedAt: '2024-07-29', status: 'screening' },
    { id: '2', title: 'UX/UI Designer', company: 'DesignCo', appliedAt: '2024-07-25', status: 'interview' },
    { id: '4', title: 'Data Scientist', company: 'DataMinds', appliedAt: '2024-07-22', status: 'offer' },
];

const statusClassMap: { [key: string]: string } = {
    submitted: 'bg-yellow-500/20 text-yellow-700',
    screening: 'bg-blue-500/20 text-blue-700',
    interview: 'bg-purple-500/20 text-purple-700',
    offer: 'bg-cyan-500/20 text-cyan-700',
    rejected: 'bg-red-500/20 text-red-700',
    hired: 'bg-green-500/20 text-green-700',
};


function RecruiterDashboard() {
  const dashboardStats = useMemo(() => {
    const totalOpenJobs = jobs.filter(j => j.status === 'open').length;
    const totalApplicants = applicantsData.length;

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const newApplicantsThisWeek = applicantsData.filter(app => new Date(app.appliedAt) >= oneWeekAgo).length;
    
    return { totalOpenJobs, totalApplicants, newApplicantsThisWeek };
  }, []);

  const monthlyApplicantsData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const month = subMonths(today, i);
        const monthName = format(month, 'MMM');
        // This is mock data generation
        const applicantCount = Math.floor(Math.random() * (250 - 50 + 1)) + 50;
        data.push({ month: monthName, applicants: applicantCount });
    }
    return data;
  }, []);

  const openJobsByDept = useMemo(() => {
    const deptCounts = jobs
        .filter(j => j.status === 'open')
        .reduce((acc, job) => {
            acc[job.department] = (acc[job.department] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    
    return Object.entries(deptCounts).map(([name, value]) => ({ 
        name, 
        value,
        key: name.toLowerCase().replace(/\s+/g, '-')
    }));
  }, []);
  
   const departmentChartConfig = {
    engineering: { label: 'Engineering', color: '#7C6AAB' },
    design: { label: 'Design', color: '#E8E3DA' },
    'data-science': { label: 'Data Science', color: '#D6D3DE' },
    product: { label: 'Product', color: '#EFE9F5' },
    marketing: { label: 'Marketing', color: '#b6a9d9' },
  } satisfies ChartConfig;

   const timeInStageData = useMemo(() => {
    return [
        { stage: 'Screening', days: 3 },
        { stage: 'Interview', days: 8 },
        { stage: 'Offer', days: 5 },
    ];
  }, []);


  const recentApplicants = useMemo(() => {
    return [...applicantsData]
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5);
  }, []);
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a look at your hiring overview.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalOpenJobs}</div>
            <p className="text-xs text-muted-foreground">Currently active job postings.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalApplicants}</div>
            <p className="text-xs text-muted-foreground">Across all open positions.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardStats.newApplicantsThisWeek}</div>
            <p className="text-xs text-muted-foreground">New applicants in the last 7 days.</p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Roles Awaiting Action</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">No shortlist action in 5+ days.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews Awaiting Feedback</CardTitle>
                <MessageSquareQuote className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Feedback is past the SLA.</p>
              </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>Applicants Over Time</CardTitle>
                <CardDescription>Number of new applicants received per month.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{ applicants: { label: 'Applicants', color: '#7C6AAB' } }} className="min-h-[300px] w-full">
                    <LineChart data={monthlyApplicantsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10}/>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="applicants" stroke="var(--color-applicants)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-applicants)" }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Open Positions by Department</CardTitle>
                <CardDescription>A breakdown of open roles.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <ChartContainer config={departmentChartConfig} className="min-h-[300px] w-full">
                    <PieChart>
                         <Tooltip content={<ChartTooltipContent nameKey="value" />} />
                        <Pie data={openJobsByDept} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} strokeWidth={2}>
                             {openJobsByDept.map((entry) => (
                                <Cell key={`cell-${entry.key}`} fill={`var(--color-${entry.key})`} />
                            ))}
                        </Pie>
                         <ChartLegend
                            content={<ChartLegendContent nameKey="key" />}
                            className="-mt-4"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Average Time in Stage</CardTitle>
                <CardDescription>Average days candidates spend in each stage.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{ days: { label: 'Days', color: '#7C6AAB' } }} className="min-h-[300px] w-full">
                    <BarChart data={timeInStageData} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" dataKey="days" unit="d" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis type="category" dataKey="stage" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                        <Bar dataKey="days" radius={4} fill="var(--color-days)" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Applicants</CardTitle>
                    <CardDescription>A look at the newest candidates.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                    {/* This should eventually link to a full applicant list page */}
                    <Link href="#">View All</Link>
                </Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Match Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApplicants.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell className="text-muted-foreground">{jobs.find(j => j.applicantCount > 0)?.title || 'Unassigned'}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(app.appliedAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className={`text-right font-bold ${getScoreColor(app.matchScore)}`}>{app.matchScore}%</TableCell>
                </TableRow>
              ))}
              {recentApplicants.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No recent applicants.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CandidateDashboard() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome, {user?.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's a summary of your recent job applications.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidateApplications.length}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidateApplications.filter(a => a.status !== 'offer').length}</div>
            <p className="text-xs text-muted-foreground">Your applications are under review.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidateApplications.filter(a => a.status === 'interview').length}</div>
            <p className="text-xs text-muted-foreground">You have upcoming interviews.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>My Applications</CardTitle>
                    <CardDescription>A quick look at your recent applications.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/my-applications">View All Applications</Link>
                </Button>
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
              {candidateApplications.slice(0,3).map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.title}</TableCell>
                  <TableCell>{app.company}</TableCell>
                  <TableCell>{app.appliedAt}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={`${statusClassMap[app.status]} capitalize hover:${statusClassMap[app.status]}`}
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


export default function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'recruiter') {
    return <RecruiterDashboard />;
  }
  
  if (user?.role === 'candidate') {
    return <CandidateDashboard />;
  }

  // Fallback or loading state
  return null;
}
