'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { resolveHiringStageLabel } from '@/lib/hiring-stages';
import { portalApi } from '@/lib/portal-api';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function MyApplicationsPage() {
    const { toast } = useToast();
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await portalApi.getMyApplications();
                setApplications(res.items);
            } catch (error) {
                toast({
                    title: 'Failed to load applications',
                    description: error instanceof Error ? error.message : 'Please ensure you are logged in.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [toast]);

    const statusVariantMap: { [key: string]: string } = {
        applied: 'bg-yellow-500/20 text-yellow-700',
        screening: 'bg-blue-500/20 text-blue-700',
        technical_interview: 'bg-purple-500/20 text-purple-700',
        hr_interview: 'bg-indigo-500/20 text-indigo-700',
        offer: 'bg-cyan-500/20 text-cyan-700',
        rejected: 'bg-red-500/20 text-red-700',
        hired: 'bg-green-500/20 text-green-700',
    };

    const getStageLabel = (app: any) => {
        const stageKey = app.stage;
        const customStages = app.job?.customStages;
        if (customStages && Array.isArray(customStages)) {
            const stageObj = customStages.find((s: any) => s.stage === stageKey);
            if (stageObj) return resolveHiringStageLabel(stageObj);
        }
        return resolveHiringStageLabel({ stage: stageKey, label: null });
    };

    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">My Applications</h1>
                <p className="text-muted-foreground">Track the status of all your job applications here.</p>
            </div>
            <Card>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="pl-6">Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                          <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                              </TableCell>
                          </TableRow>
                      ) : applications.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No applications yet. Go to <Link className="underline" href="/find-jobs">Find Jobs</Link> to apply.
                            </TableCell>
                        </TableRow>
                      ) : (
                          applications.map((app) => (
                              <TableRow key={app.pipelineId}>
                                  <TableCell className="font-medium pl-6">{app.job.title}</TableCell>
                                  <TableCell className="font-medium text-muted-foreground">{app.job.companyName || app.job.company || app.job.tenant?.name || 'Company'}</TableCell>
                                  <TableCell className="capitalize">{app.job.department || 'General'}</TableCell>
                                  <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                      <Badge variant="secondary" className={`${statusVariantMap[app.stage] || ''}`}>
                                          {getStageLabel(app)}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="text-right pr-6">
                                      <Button asChild variant="outline" size="sm">
                                          <Link href={`/my-applications/${app.pipelineId}`}>
                                              View Details
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
    )
}
