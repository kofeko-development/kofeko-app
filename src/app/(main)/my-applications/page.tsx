'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

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

export default function MyApplicationsPage() {
    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">My Applications</h1>
                <p className="text-muted-foreground">Track the status of all your job applications here.</p>
            </div>
            <Card>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {candidateApplications.map((app) => (
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
                        <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                            <Link href={`/my-applications/${app.id}`}>View Application<ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
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
