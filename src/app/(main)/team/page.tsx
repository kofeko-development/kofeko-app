
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
import { usePathname } from 'next/navigation';
import { stageOneApi } from '@/lib/stage1-2-api';
import { mapStaffUserToDisplay } from '@/lib/admin-api';
import { useAuth } from '@/lib/auth';
import { useInvalidateTeam, useTeamList } from '@/hooks/use-team';
import {
    INVITE_ACCESS_MAIN_OPTIONS,
    INVITE_ACCESS_OTHER,
    type BackendRoleName,
    type InviteAccessChoice,
} from '@/lib/rbac-templates';
import { InvitePermissionCheckboxes } from '@/components/invite-permission-checkboxes';
import { InviteRoleDetailsPanel } from '@/components/invite-role-details-panel';

export default function TeamManagementPage() {
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const invalidateTeam = useInvalidateTeam();
    const pathname = usePathname();
    const teamBasePath = pathname.startsWith('/admin/team') ? '/admin/team' : '/team';
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [accessChoice, setAccessChoice] = useState<InviteAccessChoice>('recruiter');
    const [otherRoleTitle, setOtherRoleTitle] = useState('');
    const [otherPermissionKeys, setOtherPermissionKeys] = useState<string[]>([]);

    const {
        data: teamData,
        isLoading: loadingTeam,
        isError,
        error,
    } = useTeamList({ page: 1, limit: 100 }, { enabled: !authLoading && !!user });

    const teamMembers = useMemo(
        () => (teamData?.items ?? []).map(mapStaffUserToDisplay),
        [teamData],
    );

    useEffect(() => {
        if (!isError) return;
        toast({
            title: 'Could not load team',
            description: error instanceof Error ? error.message : 'Try again later.',
            variant: 'destructive',
        });
    }, [isError, error, toast]);

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
                    description: `We emailed an invitation link to ${email.trim()} to set up their password. Ask them to check their inbox and spam.`,
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
                    description: `We emailed an invitation link to ${email.trim()} to set up their password. Ask them to check their inbox and spam.`,
                });
            }

      setIsDialogOpen(false);
      resetInviteForm();
      await invalidateTeam();
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
                        <Link href={`${teamBasePath}/roles`}>
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
                        <DialogContent className="fixed inset-0 left-0 top-0 z-50 flex h-screen w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 data-[state=closed]:slide-out-to-bottom-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100">
                            <div className="flex h-full min-h-0 flex-col bg-background">
                                <DialogHeader className="shrink-0 border-b px-6 py-5 text-left">
                                    <DialogTitle className="text-2xl">Invite a new team member</DialogTitle>
                                    <DialogDescription className="max-w-2xl">
                                        They will receive an email with instructions to set up their account. Access role controls what they can see and do.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleInvite} className="flex min-h-0 flex-1 flex-col">
                                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                                        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                                            <div className="grid gap-6 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input id="name" name="name" className="h-11" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input id="email" name="email" type="email" className="h-11" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="invite-access-main">Access role</Label>
                                                <Select
                                                    value={accessChoice}
                                                    onValueChange={(v) => setAccessChoice(v as InviteAccessChoice)}
                                                    required
                                                >
                                                    <SelectTrigger id="invite-access-main" className="h-11">
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
                                            </div>

                                            <InviteRoleDetailsPanel accessChoice={accessChoice} />

                                            {accessChoice === INVITE_ACCESS_OTHER ? (
                                                <div className="space-y-6 rounded-xl border bg-card p-5 shadow-sm">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="invite-other-title">Position / role name</Label>
                                                        <Input
                                                            id="invite-other-title"
                                                            value={otherRoleTitle}
                                                            onChange={(e) => setOtherRoleTitle(e.target.value)}
                                                            placeholder="e.g. VP Talent, Campus Lead"
                                                            maxLength={120}
                                                            className="h-11"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label>Permissions</Label>
                                                        <InvitePermissionCheckboxes
                                                            value={otherPermissionKeys}
                                                            onChange={setOtherPermissionKeys}
                                                            disabled={isInviting}
                                                            idPrefix="team-invite"
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <DialogFooter className="shrink-0 border-t bg-background px-6 py-4 sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                            disabled={isInviting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isInviting}>
                                            {isInviting ? 'Sending...' : 'Send Invite'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <TeamMembersTable users={teamMembers} loading={loadingTeam} />

        </div>
    );
}
