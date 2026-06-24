
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import AppFooter from "@/components/app-footer";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePortalJobs } from "@/hooks/use-portal";


export default function PublicJobsPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        isError,
        error,
    } = usePortalJobs({ limit: 30 });

    const jobs = data?.items ?? [];

    useEffect(() => {
        if (!isError) return;
        toast({
            title: "Unable to load jobs",
            description: error instanceof Error ? error.message : "Please refresh and try again.",
            variant: "destructive",
        });
    }, [isError, error, toast]);

    const filtered = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return jobs;
        return jobs.filter((j) => {
            return (
                j.title.toLowerCase().includes(q) ||
                j.tenant.name.toLowerCase().includes(q) ||
                j.description.toLowerCase().includes(q)
            );
        });
    }, [jobs, searchTerm]);

    return (
        <div className="flex flex-col min-h-screen">
            <PublicNavbar />
            <main className="flex-1 text-foreground mt-20">
                <section className="bg-muted/40 py-12">
                    <div className="container">
                        <h1 className="text-4xl font-bold font-headline">Find Your Next Opportunity</h1>
                        <p className="text-muted-foreground mt-2">Browse through our open positions and find your perfect fit.</p>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title, company, or keyword..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="ny">New York, NY</SelectItem>
                                    <SelectItem value="sf">San Francisco, CA</SelectItem>
                                    <SelectItem value="tx">Austin, TX</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>
                <section className="py-12">
                    <div className="container">
                        {filtered.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map((job) => (
                                    <Card key={job.id} className="flex flex-col hover:shadow-md transition-shadow">
                                        <CardContent className="flex-1 p-6">
                                            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                                <Link href={`/open-positions/${job.id}`}>{job.title}</Link>
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">{job.tenant.name}</p>
                                            <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{job.description}</p>
                                            <div className="mt-5">
                                                <Button asChild className="w-full">
                                                    <Link href={`/open-positions/${job.id}`}>View & Apply</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center text-muted-foreground">
                                    <p className="font-semibold">{isLoading ? "Loading jobs..." : "No jobs available"}</p>
                                    <p className="text-sm">
                                        {isLoading ? "Please wait." : "Open positions will appear here once companies post jobs."}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </section>
            </main>
            <AppFooter />
        </div>
    );
}
