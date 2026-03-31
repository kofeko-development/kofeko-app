
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Search } from "lucide-react";
import PublicNavbar from "@/components/public-navbar";
import AppFooter from "@/components/app-footer";
import { jobs } from "@/lib/jobs-data";


export default function PublicJobsPage() {
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
                                <Input placeholder="Search by title, company, or keyword..." className="pl-10" />
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
                    <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.filter(j => j.status === 'open').map(job => (
                            <Card key={job.id} className="flex flex-col hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle>{job.title}</CardTitle>
                                    <CardDescription className="flex items-center flex-wrap gap-x-4 gap-y-1 pt-2">
                                        <span className="flex items-center gap-2"><Briefcase className="size-4" /> {job.company}</span>
                                        <span className="flex items-center gap-2"><MapPin className="size-4" /> {job.location}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/open-positions/${job.id}`}>View & Apply</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>
            <AppFooter />
        </div>
    );
}
