'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Shield, User as UserIcon, Building2, Save } from 'lucide-react';
import { useAuth, mapBackendUser, type BackendUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api-client';
import { staffInviteStatusLabel } from '@/lib/admin-api';
import {
  getGroupedStaffPermissions,
  getStaffRoleDescription,
  getStaffRoleTitle,
  labelForPermission,
  rbacModuleTitle,
} from '@/lib/staff-profile';

export default function MyProfilePage() {
  const { user, updateCurrentUser, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && user?.role === 'candidate') {
      router.replace('/profile');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? user.name.split(' ')[0] ?? '');
    setLastName(user.lastName ?? user.name.split(' ').slice(1).join(' ') ?? '');
  }, [user]);

  const roleTitle = useMemo(() => (user ? getStaffRoleTitle(user) : ''), [user]);
  const roleDescription = useMemo(() => (user ? getStaffRoleDescription(user) : ''), [user]);
  const permissionGroups = useMemo(
    () => getGroupedStaffPermissions(user?.permissions),
    [user?.permissions],
  );

  const hasNameChanges = useMemo(() => {
    if (!user) return false;
    const currentFirst = user.firstName ?? user.name.split(' ')[0] ?? '';
    const currentLast = user.lastName ?? user.name.split(' ').slice(1).join(' ') ?? '';
    return firstName.trim() !== currentFirst || lastName.trim() !== currentLast;
  }, [user, firstName, lastName]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !hasNameChanges) return;

    if (firstName.trim().length < 2) {
      toast({
        title: 'First name required',
        description: 'Please enter at least 2 characters for your first name.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await apiRequest<BackendUser>('/auth/profile', {
        method: 'PATCH',
        auth: true,
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim() || 'User',
        },
      });

      const mapped = mapBackendUser(updated);
      updateCurrentUser({
        ...mapped,
        role: user.role,
        permissions: user.permissions,
        backendRoles: user.backendRoles,
        companyRole: user.companyRole,
        company: user.company,
      });

      toast({
        title: 'Profile updated',
        description: 'Your name has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role === 'candidate') {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">
          Your account details, role, and access within {user.company ?? 'your company'}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Personal information
          </CardTitle>
          <CardDescription>Basic details for your staff account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void handleSave(event)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  value={user.email}
                  readOnly
                  className="bg-muted pl-10 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            {user.company && (
              <div className="space-y-2">
                <Label>Company</Label>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {user.company}
                </div>
              </div>
            )}

            {hasNameChanges && (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save changes
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role & responsibilities
          </CardTitle>
          <CardDescription>What your role is responsible for in Kofeko.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 text-sm">
              {roleTitle}
            </Badge>
            <Badge
              variant="secondary"
              className={
                user.status === 'active'
                  ? 'bg-green-500/20 text-green-700'
                  : user.status === 'suspended'
                    ? 'bg-red-500/20 text-red-700'
                    : 'bg-yellow-500/20 text-yellow-700'
              }
            >
              {staffInviteStatusLabel(user.status)}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{roleDescription}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access & permissions</CardTitle>
          <CardDescription>Features and actions available on your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {permissionGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No permissions are assigned to this account yet.</p>
          ) : (
            permissionGroups.map((group) => (
              <div key={group.moduleKey}>
                <h3 className="mb-3 text-sm font-semibold">{rbacModuleTitle(group.moduleKey)}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.keys.map((key) => (
                    <Badge key={key} variant="secondary" className="font-normal">
                      {labelForPermission(key)}
                    </Badge>
                  ))}
                </div>
                <Separator className="mt-6" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
