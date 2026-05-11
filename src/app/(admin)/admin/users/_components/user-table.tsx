
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, UserCheck, UserX, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { displayStatusToStaffStatus, updateStaffUserStatus } from '@/lib/admin-api';


const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
    }
    return names[0].charAt(0);
}

const roleVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    operator: 'destructive',
    recruiter: 'default',
    candidate: 'secondary'
};

const statusVariantMap: { [key: string]: string } = {
    active: 'bg-green-500/20 text-green-700',
    pending: 'bg-yellow-500/20 text-yellow-700',
    suspended: 'bg-red-500/20 text-red-700',
};

interface UserTableProps {
    users: User[];
    title: string;
    description: string;
    loading?: boolean;
    /** Staff listing only: PATCH user status via API. */
    allowStatusActions?: boolean;
    onStaffStatusUpdated?: () => void;
    /** e.g. “Add recruiter” control shown next to the title */
    headerAction?: React.ReactNode;
}

export default function UserTable({
    users: initialUsers,
    title,
    description,
    loading = false,
    allowStatusActions = false,
    onStaffStatusUpdated,
    headerAction,
}: UserTableProps) {
    const { toast } = useToast();
    const [users, setUsers] = useState(initialUsers);
    const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchLower === '' ||
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                (user.company && user.company.toLowerCase().includes(searchLower));
            
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

            return matchesSearch && matchesStatus;
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [users, searchTerm, statusFilter]);

    const handleStatusChange = async (userId: string, newStatus: User['status']) => {
        if (!allowStatusActions || !newStatus) return;

        const prevSnapshot = users;
        setUsers((prevUsers) => prevUsers.map((u) => (u.uid === userId ? { ...u, status: newStatus } : u)));

        try {
            setStatusUpdatingId(userId);
            await updateStaffUserStatus(userId, displayStatusToStaffStatus(newStatus));
            toast({
                title: 'User status updated',
                description: `The user has been moved to ${newStatus}.`,
            });
            onStaffStatusUpdated?.();
        } catch (error) {
            setUsers(prevSnapshot);
            toast({
                title: 'Update failed',
                description: error instanceof Error ? error.message : 'Could not update status.',
                variant: 'destructive',
            });
        } finally {
            setStatusUpdatingId(null);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
            </div>

             <Card>
                <CardContent className='pt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-end'>
                    <div className="space-y-2 lg:col-span-2">
                        <label htmlFor="search" className="text-sm font-medium">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="search"
                                placeholder="Filter by name, email, company..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id='status'>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Loading…
                                    </TableCell>
                                </TableRow>
                             )}
                             {!loading && filteredUsers.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className={user.role === 'operator' ? 'bg-destructive text-destructive-foreground' : ''}>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                {user.company && <p className="text-xs text-muted-foreground">{user.company}</p>}
                                            </div>
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={roleVariantMap[user.role]} className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`${statusVariantMap[user.status ?? 'pending']} capitalize`}>
                                            {user.status ?? 'pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {allowStatusActions ? (
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={user.role === 'operator' || statusUpdatingId === user.uid}>
                                                    Manage
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => void handleStatusChange(user.uid, 'active')}>
                                                    <UserCheck className="mr-2 h-4 w-4" /> Activate User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => void handleStatusChange(user.uid, 'suspended')}>
                                                    <UserX className="mr-2 h-4 w-4" /> Suspend User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => void handleStatusChange(user.uid, 'pending')}>
                                                   <Clock className="mr-2 h-4 w-4" /> Move to Pending
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                             {!loading && filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
