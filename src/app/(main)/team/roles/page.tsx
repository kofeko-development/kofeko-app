
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ShieldCheck, FileEdit, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import type { CompanyRole } from '@/lib/types';


type Permission = 'canCreateJob' | 'canManageJob' | 'canChangeStatus' | 'canInviteMembers';

interface Role {
    name: CompanyRole | (string & {});
    isDefault: boolean;
    permissions: Permission[];
}

const allPermissions: { id: Permission, label: string }[] = [
    { id: 'canCreateJob', label: 'Create & Edit Jobs' },
    { id: 'canManageJob', label: 'Close & Share Jobs' },
    { id: 'canChangeStatus', label: 'Change Applicant Status' },
    { id: 'canInviteMembers', label: 'Invite Team Members' },
];

const initialRoles: Role[] = [
    { name: 'HR Admin', isDefault: true, permissions: ['canCreateJob', 'canManageJob', 'canChangeStatus', 'canInviteMembers'] },
    { name: 'Hiring Manager', isDefault: true, permissions: ['canChangeStatus'] },
    { name: 'Interviewer', isDefault: true, permissions: [] },
];

export default function RoleManagementPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [roles, setRoles] = useState(initialRoles);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const openDialog = (role?: Role) => {
        setEditingRole(role || { name: '', isDefault: false, permissions: [] });
        setIsDialogOpen(true);
    };

    const handleSaveRole = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const roleName = formData.get('role-name') as string;
        const selectedPermissions = allPermissions
            .filter(p => formData.has(p.id))
            .map(p => p.id);

        // In a real app, this would be an API call
        toast({
            title: editingRole?.name ? 'Role Updated' : 'Role Created',
            description: `The role "${roleName}" has been saved successfully.`
        });

        // This is a mock implementation
        if (editingRole && editingRole.name !== '') {
            setRoles(roles.map(r => r.name === editingRole.name ? { ...r, name: roleName, permissions: selectedPermissions as Permission[] } : r));
        } else {
            setRoles([...roles, { name: roleName, isDefault: false, permissions: selectedPermissions as Permission[] }]);
        }

        setIsDialogOpen(false);
        setEditingRole(null);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 w-fit px-2">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Team
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Role Management</h1>
                    <p className="text-muted-foreground">Create and configure custom roles for your organization.</p>
                </div>
                <Button onClick={() => openDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Role
                </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <Card key={role.name}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5"/> {role.name}
                                </CardTitle>
                                {!role.isDefault && (
                                     <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(role)}>
                                            <FileEdit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                     </div>
                                )}
                            </div>
                            <CardDescription>{role.isDefault ? 'Default system role' : 'Custom organizational role'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold text-sm mb-2">Permissions:</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                {allPermissions.map(p => (
                                     <div key={p.id} className="flex items-center gap-2">
                                        <Checkbox checked={role.permissions.includes(p.id)} disabled />
                                        <span>{p.label}</span>
                                     </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRole?.name ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                        <DialogDescription>
                            Define the role name and what actions they are permitted to perform.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveRole}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="role-name">Role Name</Label>
                                <Input id="role-name" name="role-name" defaultValue={editingRole?.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-2 gap-2 p-4 border rounded-md">
                                    {allPermissions.map(p => (
                                        <div key={p.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={p.id} 
                                                name={p.id} 
                                                defaultChecked={editingRole?.permissions.includes(p.id)}
                                            />
                                            <Label htmlFor={p.id} className="font-normal">{p.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Role</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
