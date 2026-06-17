

'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, ArrowUpRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { portalApi, type PortalJobListItem } from "@/lib/portal-api";
import { resolveJobEmploymentType, resolveJobWorkMode } from "@/lib/job-display";

const locationValue = (raw: string | null | undefined) => (raw ?? '').trim();


export default function FindJobsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [jobs, setJobs] = useState<PortalJobListItem[]>([]);
    const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        Promise.all([
            portalApi.listAllJobs({ limit: 100 }),
            portalApi.getMyApplications({ limit: 100 }).catch(() => ({ items: [] }))
        ])
            .then(([jobsRes, appsRes]) => {
                if (!cancelled) {
                    setJobs(jobsRes.items ?? []);
                    const appliedIds = new Set((appsRes.items ?? []).map((item) => item.job.id));
                    setAppliedJobIds(appliedIds);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    toast({
                        title: "Unable to load jobs",
                        description: err instanceof Error ? err.message : "Please refresh and try again.",
                        variant: "destructive",
                    });
                    setJobs([]);
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount; toast is unstable across renders
    }, []);

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const searchLower = searchTerm.toLowerCase();
            const desc = (job.description ?? '').toLowerCase();
            const matchesSearch =
                searchLower === '' ||
                job.title.toLowerCase().includes(searchLower) ||
                job.tenant.name.toLowerCase().includes(searchLower) ||
                desc.includes(searchLower);

            const jobLocation = locationValue(job.location).toLowerCase();
            const matchesLocation =
                locationFilter === 'all' || jobLocation.includes(locationFilter.toLowerCase());

            const workMode = resolveJobWorkMode(job.department);
            let workModeFilter: 'remote' | 'hybrid' | 'onsite' = 'onsite';
            if (workMode?.toLowerCase() === 'remote' || jobLocation === 'remote' || jobLocation.includes('remote')) {
                workModeFilter = 'remote';
            } else if (workMode?.toLowerCase() === 'hybrid' || jobLocation.includes('hybrid')) {
                workModeFilter = 'hybrid';
            }

            const matchesType =
                typeFilter === 'all' ||
                (typeFilter === 'remote' && workModeFilter === 'remote') ||
                (typeFilter === 'hybrid' && workModeFilter === 'hybrid') ||
                (typeFilter === 'onsite' && workModeFilter === 'onsite');

            return matchesSearch && matchesLocation && matchesType;
        });
    }, [jobs, searchTerm, locationFilter, typeFilter]);


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold font-headline">Find Your Next Opportunity</h1>
                <p className="text-muted-foreground">Browse through our open positions and find your perfect fit.</p>
                </div>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative md:col-span-2">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by title, company, or keyword..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                             />
                        </div>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                                <SelectItem value="new york">New York, NY</SelectItem>
                                <SelectItem value="san francisco">San Francisco, CA</SelectItem>
                                <SelectItem value="austin">Austin, TX</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by work mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Work Modes</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                                <SelectItem value="onsite">Onsite</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
                {filteredJobs.length > 0 ? filteredJobs.map(job => {
                    const workMode = resolveJobWorkMode(job.department);
                    const employmentType = resolveJobEmploymentType(job.employmentType, job.department);
                    return (
                    <Card key={job.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                    <Link href={`/open-positions/${job.id}`}>{job.title}</Link>
                                </h3>
                                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-2"><Briefcase className="size-4" /> {job.tenant.name}</span>
                                    <span className="flex items-center gap-2"><MapPin className="size-4" /> {locationValue(job.location) || '—'}</span>
                                    {workMode ? <span>{workMode}</span> : null}
                                    {employmentType ? <span>{employmentType}</span> : null}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                            </div>
                            {appliedJobIds.has(job.id) ? (
                                <Button disabled className="shrink-0 bg-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/30 border-transparent cursor-not-allowed">
                                    Already Applied
                                </Button>
                            ) : (
                                <Button asChild className="shrink-0">
                                    <Link href={`/open-positions/${job.id}`}>
                                    View & Apply <ArrowUpRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                    );
                }) : (
                     <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <p className="font-semibold">{isLoading ? 'Loading jobs...' : 'No jobs available'}</p>
                            <p className="text-sm">
                              {isLoading ? 'Please wait.' : 'New jobs will appear here once companies post openings.'}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
