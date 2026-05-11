'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

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
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No applications yet. Go to <Link className="underline" href="/find-jobs">Find Jobs</Link> to apply.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    )
}
