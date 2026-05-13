
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
import {
    INVITE_ACCESS_MAIN_OPTIONS,
    INVITE_ACCESS_OTHER,
    type BackendRoleName,
    type InviteAccessChoice,
} from '@/lib/rbac-templates';
import { InvitePermissionCheckboxes } from '@/components/invite-permission-checkboxes';

export default function TeamManagementPage() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [accessChoice, setAccessChoice] = useState<InviteAccessChoice>('recruiter');
    const [otherRoleTitle, setOtherRoleTitle] = useState('');
    const [otherPermissionKeys, setOtherPermissionKeys] = useState<string[]>([]);
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

    const accessSummary =
        INVITE_ACCESS_MAIN_OPTIONS.find((o) => o.value === accessChoice)?.summary ?? '';

    const resetInviteForm = () => {
        setAccessChoice('recruiter');
        setOtherRoleTitle('');
        setOtherPermissionKeys([]);
    };

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;

        if (accessChoice === INVITE_ACCESS_OTHER) {
            if (!otherRoleTitle.trim()) {
                toast({
                    title: 'Position / role name required',
                    description: 'Enter a label for this role.',
                    variant: 'destructive',
                });
                return;
            }
            if (otherPermissionKeys.length === 0) {
                toast({
                    title: 'Pick permissions',
                    description: 'Select at least one permission or use a preset.',
                    variant: 'destructive',
                });
                return;
            }
        }

        const [firstName, ...rest] = name.trim().split(' ');
        const lastName = rest.join(' ') || 'User';

        try {
            setIsInviting(true);

            if (accessChoice === INVITE_ACCESS_OTHER) {
                await stageOneApi.inviteUser({
                    firstName,
                    lastName,
                    email,
                    position: otherRoleTitle.trim(),
                    permissionKeys: otherPermissionKeys,
                });
                toast({
                    title: 'Invitation sent',
                    description: `We emailed ${email.trim()} with a welcome note, temporary password, and an accept-invite link to set their own password. Ask them to check inbox and spam.`,
                });
            } else {
                const roleName = accessChoice as BackendRoleName;
                await stageOneApi.inviteUser({
                    firstName,
                    lastName,
                    email,
                    roleName,
                });
                toast({
                    title: 'Invitation sent',
                    description: `We emailed ${email.trim()} with a welcome note, temporary password, and an accept-invite link to set their own password. Ask them to check inbox and spam.`,
                });
            }

            setIsDialogOpen(false);
            resetInviteForm();
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
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetInviteForm();
                    }}>
                        <DialogTrigger asChild>
                             <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="flex max-h-[92vh] max-w-lg flex-col gap-0 overflow-hidden sm:max-w-xl md:max-w-2xl">
                            <DialogHeader>
                            <DialogTitle>Invite a new team member</DialogTitle>
                            <DialogDescription>
                                They will receive an email with instructions to set up their account. Access role controls what they can see and do.
                            </DialogDescription>
                            </DialogHeader>
                             <form onSubmit={handleInvite} className="flex min-h-0 flex-1 flex-col gap-0">
                                <div className="grid gap-4 overflow-y-auto py-4 pr-1">
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
                                     <div className="grid grid-cols-4 items-start gap-4">
                                        <Label htmlFor="invite-access-main" className="pt-2 text-right">
                                            Access role
                                        </Label>
                                        <div className="col-span-3 space-y-2">
                                            <Select
                                                value={accessChoice}
                                                onValueChange={(v) => setAccessChoice(v as InviteAccessChoice)}
                                                required
                                            >
                                                <SelectTrigger id="invite-access-main">
                                                    <SelectValue placeholder="Select access" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {INVITE_ACCESS_MAIN_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                                                {accessChoice === INVITE_ACCESS_OTHER ? (
                                                    <>
                                                        <span className="font-medium text-foreground">Other: </span>
                                                        Add a position name and tick each permission. Use presets for quick bundles.
                                                    </>
                                                ) : (
                                                    accessSummary
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {accessChoice === INVITE_ACCESS_OTHER ? (
                                        <>
                                            <div className="grid grid-cols-4 items-start gap-4">
                                                <Label htmlFor="invite-other-title" className="pt-2 text-right">
                                                    Position / role name
                                                </Label>
                                                <div className="col-span-3">
                                                    <Input
                                                        id="invite-other-title"
                                                        value={otherRoleTitle}
                                                        onChange={(e) => setOtherRoleTitle(e.target.value)}
                                                        placeholder="e.g. VP Talent, Campus Lead"
                                                        maxLength={120}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-start gap-4">
                                                <Label className="pt-2 text-right">
                                                    Permissions
                                                </Label>
                                                <div className="col-span-3">
                                                    <InvitePermissionCheckboxes
                                                        value={otherPermissionKeys}
                                                        onChange={setOtherPermissionKeys}
                                                        disabled={isInviting}
                                                        idPrefix="team-invite"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                                <DialogFooter className="border-t bg-background pt-4">
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
