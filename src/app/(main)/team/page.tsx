
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';
import TeamMembersTable from './_components/team-members-table';
import { PlusCircle, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { stageOneApi } from '@/lib/stage1-2-api';
import { listStaffUsers, mapStaffUserToDisplay } from '@/lib/admin-api';

export default function TeamManagementPage() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(true);

    const loadTeam = useCallback(async () => {
        setLoadingTeam(true);
        try {
            const res = await listStaffUsers(1, 100);
            setTeamMembers(res.items.map(mapStaffUserToDisplay));
        } catch (e) {
            setTeamMembers([]);
            toast({
                title: 'Could not load team',
                description: e instanceof Error ? e.message : 'Try again later.',
                variant: 'destructive',
            });
        } finally {
            setLoadingTeam(false);
        }
    }, [toast]);

    useEffect(() => {
        void loadTeam();
    }, [loadTeam]);

    const mapRoleToBackend = (role: string) => {
        if (role === 'Hiring Manager') return 'hr_manager';
        if (role === 'Interviewer') return 'interviewer';
        return undefined;
    };

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const role = formData.get('role') as string;
        const [firstName, ...rest] = name.trim().split(' ');
        const lastName = rest.join(' ') || 'User';

        try {
            setIsInviting(true);
            await stageOneApi.inviteUser({
                firstName,
                lastName,
                email,
                roleName: mapRoleToBackend(role),
            });

            toast({
                title: "Invitation Sent!",
                description: `${name} has been invited to join the team as a ${role}.`,
            });

            setIsDialogOpen(false);
            await loadTeam();
        } catch (error) {
            toast({
                title: 'Invite failed',
                description: error instanceof Error ? error.message : 'Unable to send invitation.',
                variant: 'destructive',
            });
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold font-headline">Team Management</h1>
                <p className="text-muted-foreground">Invite and manage your {"organization's"} members.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/team/roles">
                            <ShieldCheck className="mr-2 h-4 w-4" /> Manage Roles
                        </Link>
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                             <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle>Invite a new team member</DialogTitle>
                            <DialogDescription>
                                They will receive an email with instructions to set up their account.
                            </DialogDescription>
                            </DialogHeader>
                             <form onSubmit={handleInvite}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Full Name
                                        </Label>
                                        <Input id="name" name="name" className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">
                                            Email
                                        </Label>
                                        <Input id="email" name="email" type="email" className="col-span-3" required />
                                    </div>
                                     <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="role" className="text-right">
                                            Role
                                        </Label>
                                        <Select name="role" required>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Hiring Manager">Hiring Manager</SelectItem>
                                                <SelectItem value="Interviewer">Interviewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isInviting}>
                                        {isInviting ? 'Sending...' : 'Send Invite'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {loadingTeam ? (
                <p className="text-muted-foreground text-sm">Loading team…</p>
            ) : (
                <TeamMembersTable users={teamMembers} />
            )}

        </div>
    );
}
