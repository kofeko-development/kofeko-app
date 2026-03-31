
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock, TrendingUp, UserPlus, Timer, ArrowRightLeft } from 'lucide-react';
import { allUsers } from '@/lib/admin-data';
import { useMemo } from 'react';
import type { UserRole } from '@/lib/types';
import { Separator } from "@/components/ui/separator";

export default function AdminDashboardPage() {
    const userStats = useMemo(() => {
        const totalUsers = allUsers.length;
        const totalRecruiters = allUsers.filter(u => u.role === 'recruiter').length;
        const totalCandidates = allUsers.filter(u => u.role === 'candidate').length;
        
        const activeUsers = allUsers.filter(u => u.status === 'active').length;
        const pendingUsers = allUsers.filter(u => u.status === 'pending').length;
        const suspendedUsers = allUsers.filter(u => u.status === 'suspended').length;
        
        return { totalUsers, totalRecruiters, totalCandidates, activeUsers, pendingUsers, suspendedUsers };
    }, []);

    const siteAnalytics = {
        totalVisits: '12,450',
        uniqueVisitors: '8,980',
        avgSessionDuration: '3m 25s',
        bounceRate: '28.5%'
    };

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>

            {/* User Management Stats */}
            <div>
                 <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                {userStats.totalRecruiters} Recruiters, {userStats.totalCandidates} Candidates
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userStats.activeUsers}</div>
                            <p className="text-xs text-muted-foreground">Currently active on the platform</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userStats.pendingUsers}</div>
                            <p className="text-xs text-muted-foreground">Awaiting access approval</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
                            <UserX className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userStats.suspendedUsers}</div>
                            <p className="text-xs text-muted-foreground">Access has been revoked</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Website Analytics Stats */}
             <div>
                 <h2 className="text-xl font-semibold mb-4">Website Analytics</h2>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Website Visits</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{siteAnalytics.totalVisits}</div>
                            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{siteAnalytics.uniqueVisitors}</div>
                            <p className="text-xs text-muted-foreground">+1,200 this month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                            <Timer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{siteAnalytics.avgSessionDuration}</div>
                            <p className="text-xs text-muted-foreground">An increase of 15s from last week</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{siteAnalytics.bounceRate}</div>
                            <p className="text-xs text-muted-foreground">Down by 2% this month</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Overview of the latest platform activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center text-muted-foreground p-12">
                        <p>Recent activity feed coming soon.</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
