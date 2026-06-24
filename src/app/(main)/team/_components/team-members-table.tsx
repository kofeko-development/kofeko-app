
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { User, CompanyRole } from '@/lib/types';
import { removeStaffUser, staffInviteStatusLabel, updateStaffUserRole, updateStaffUserStatus } from '@/lib/admin-api';
import { UserTableRowsSkeleton } from '@/components/loading/user-table-rows-skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
    }
    return names[0].charAt(0);
}

const roleVariantMap: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Company Admin': 'default',
    'Hiring Manager': 'secondary',
    'Interviewer': 'secondary'
};


interface TeamMembersTableProps {
    users: User[];
    loading?: boolean;
}

export default function TeamMembersTable({ users: initialUsers, loading = false }: TeamMembersTableProps) {
    const { toast } = useToast();
    const [users, setUsers] = useState(initialUsers);

    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleRoleChange = async (userId: string, newRole: CompanyRole) => {
        try {
            // Map CompanyRole to backend role names
            let backendRole = 'recruiter';
            if (newRole === 'Company Admin') backendRole = 'hr_manager';
            else if (newRole === 'Interviewer') backendRole = 'interviewer';
            
            await updateStaffUserRole(userId, backendRole);
            setUsers(prevUsers => prevUsers.map(u => u.uid === userId ? { ...u, companyRole: newRole } : u));
            toast({
                title: "User role updated",
                description: `The user's role has been changed to ${newRole}.`,
            });
        } catch (error) {
            toast({
                title: "Failed to update role",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: 'destructive'
            });
        }
    }

    const handleRemoveClick = (user: User) => {
        setSelectedUser(user);
        setIsAlertOpen(true);
    };

    const handleConfirmRemove = async () => {
         if (!selectedUser) return;
         try {
             await removeStaffUser(selectedUser.uid);
             setUsers(prevUsers => prevUsers.filter(u => u.uid !== selectedUser.uid));
             toast({
                 title: "User Removed",
                 description: `${selectedUser.name} has been removed from the team.`,
                 variant: 'destructive'
             });
         } catch (error) {
             toast({
                 title: "Failed to remove user",
                 description: error instanceof Error ? error.message : "An error occurred",
                 variant: 'destructive'
             });
         } finally {
             setIsAlertOpen(false);
             setSelectedUser(null);
         }
    }

    const handleStatusChange = async (userId: string, status: 'active' | 'suspended') => {
        try {
            await updateStaffUserStatus(userId, status);
            setUsers(prevUsers => prevUsers.map(u => u.uid === userId ? { ...u, status } : u));
            toast({
                title: `User ${status}`,
                description: `The user has been ${status}.`,
            });
        } catch (error) {
            toast({
                title: `Failed to ${status === 'active' ? 'reactivate' : 'suspend'} user`,
                description: error instanceof Error ? error.message : "An error occurred",
                variant: 'destructive'
            });
        }
    }


    return (
        <>
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
                            {loading ? (
                                <UserTableRowsSkeleton rows={5} />
                            ) : users.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={roleVariantMap[user.companyRole!] || 'secondary'} className="capitalize">
                                            {user.companyRole}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={`${
                                                user.status === 'active'
                                                    ? 'bg-green-500/20 text-green-700'
                                                    : user.status === 'suspended'
                                                      ? 'bg-red-500/20 text-red-700'
                                                      : 'bg-yellow-500/20 text-yellow-700'
                                            } capitalize`}
                                        >
                                            {staffInviteStatusLabel(user.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={user.companyRole === 'Company Admin'}>
                                                    Manage
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => handleRoleChange(user.uid, 'Hiring Manager')}>
                                                    Change to Hiring Manager
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleRoleChange(user.uid, 'Interviewer')}>
                                                    Change to Interviewer
                                                </DropdownMenuItem>
                                                {user.status === 'suspended' ? (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(user.uid, 'active')}>
                                                        Reactivate
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onSelect={() => handleStatusChange(user.uid, 'suspended')}>
                                                        Suspend
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onSelect={() => handleRemoveClick(user)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Remove User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {!loading && users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No team members found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove <span className='font-bold'>{selectedUser?.name}</span> from your team. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmRemove} className="bg-destructive hover:bg-destructive/90">Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
