'use client';

import { useCallback, useEffect, useState } from 'react';
import UserTable from '../users/_components/user-table';
import { listStaffUsers, mapStaffUserToDisplay } from '@/lib/admin-api';
import { stageOneApi } from '@/lib/stage1-2-api';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, ChevronUp } from 'lucide-react';

export default function RecruitersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listStaffUsers(1, 100);
      setUsers(res.items.map(mapStaffUserToDisplay));
    } catch (e) {
      setUsers([]);
      toast({
        title: 'Could not load staff',
        description: e instanceof Error ? e.message : 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim().toLowerCase();
    const pos = position.trim();

    if (fn.length < 2 || ln.length < 1) {
      toast({ title: 'Check name', description: 'Enter first and last name.', variant: 'destructive' });
      return;
    }
    if (!em || !em.includes('@')) {
      toast({ title: 'Check email', description: 'Enter the recruiter’s own work email.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await stageOneApi.inviteUser({
        firstName: fn,
        lastName: ln,
        email: em,
        roleName: 'recruiter',
        ...(pos ? { position: pos.slice(0, 120) } : {}),
      });
      toast({
        title: 'Recruiter invited',
        description: `We sent login details to ${em}. They use their own email, not the company inbox.`,
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPosition('');
      setShowAddForm(false);
      await load();
    } catch (err) {
      toast({
        title: 'Invite failed',
        description: err instanceof Error ? err.message : 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add recruiter</CardTitle>
            <CardDescription>
              Enter this person’s own email (their login). We email them a temporary password and a link to set a new
              one. Their address is not your company’s shared email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleInvite(e)} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rec-first">First name</Label>
                <Input
                  id="rec-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  disabled={submitting}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rec-last">Last name</Label>
                <Input
                  id="rec-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="rec-email">Email (their login)</Label>
                <Input
                  id="rec-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="recruiter@their-domain.com"
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="rec-position">Position / title</Label>
                <Input
                  id="rec-position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Recruiter"
                  disabled={submitting}
                  maxLength={120}
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending invite…
                    </>
                  ) : (
                    'Send invite email'
                  )}
                </Button>
                <Button type="button" variant="ghost" disabled={submitting} onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <UserTable
        users={users}
        loading={loading}
        title="Recruiter Management"
        description="Staff accounts for your organization (from the API)."
        allowStatusActions
        onStaffStatusUpdated={() => void load()}
        headerAction={
          <Button type="button" variant="default" className="btn-glass shadow-md" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide form
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add recruiter
              </>
            )}
          </Button>
        }
      />
    </div>
  );
}
