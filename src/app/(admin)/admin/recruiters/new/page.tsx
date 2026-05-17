'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { stageOneApi } from '@/lib/stage1-2-api';
import {
  INVITE_ACCESS_MAIN_OPTIONS,
  INVITE_ACCESS_OTHER,
  type BackendRoleName,
  type InviteAccessChoice,
  inviteBackendRoleLabel,
} from '@/lib/rbac-templates';
import { InvitePermissionCheckboxes } from '@/components/invite-permission-checkboxes';

export default function AddRecruiterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [accessChoice, setAccessChoice] = useState<InviteAccessChoice>('recruiter');
  const [otherRoleTitle, setOtherRoleTitle] = useState('');
  const [otherPermissionKeys, setOtherPermissionKeys] = useState<string[]>([]);

  const accessSummary =
    INVITE_ACCESS_MAIN_OPTIONS.find((o) => o.value === accessChoice)?.summary ?? '';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim().toLowerCase();

    if (accessChoice === INVITE_ACCESS_OTHER) {
      if (!otherRoleTitle.trim()) {
        toast({
          title: 'Position / role name required',
          description: 'Enter how this role should be labeled (e.g. “Lead Talent Partner”).',
          variant: 'destructive',
        });
        return;
      }
      if (otherPermissionKeys.length === 0) {
        toast({
          title: 'Pick permissions',
          description: 'Select at least one permission, or use a preset button.',
          variant: 'destructive',
        });
        return;
      }
    }

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
      if (accessChoice === INVITE_ACCESS_OTHER) {
        await stageOneApi.inviteUser({
          firstName: fn,
          lastName: ln,
          email: em,
          position: otherRoleTitle.trim(),
          permissionKeys: otherPermissionKeys,
        });
        toast({
          title: 'Recruiter invited',
          description: `We emailed an invitation link to ${em} to set up their password. Custom role: “${otherRoleTitle.trim()}”. Ask them to check their inbox and spam.`,
        });
      } else {
        const roleName = accessChoice as BackendRoleName;
        await stageOneApi.inviteUser({
          firstName: fn,
          lastName: ln,
          email: em,
          roleName,
        });
        toast({
          title: 'Recruiter invited',
          description: `We emailed an invitation link to ${em} to set up their password (${inviteBackendRoleLabel(roleName)}). Ask them to check their inbox and spam.`,
        });
      }
      router.push('/admin/recruiters');
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
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 pb-4">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2 w-fit px-2" asChild>
          <Link href="/admin/recruiters">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to recruiter management
          </Link>
        </Button>
        <h1 className="font-headline text-3xl font-bold">Add recruiter</h1>
        <p className="max-w-3xl text-muted-foreground">
          Invite someone using their own work email. Choose their access level — that controls what they can open and do
          in Kofeko.
        </p>
      </div>

      <div className="w-full min-w-0">
        <form onSubmit={(e) => void handleInvite(e)} className="flex w-full min-w-0 flex-col gap-10">
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Invite details</h2>
              <p className="text-sm text-muted-foreground">
                Enter this person’s own email (their login). We will send them an email with an accept-invite link to set up their password.
              </p>
            </div>
            <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2">
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
                <Label htmlFor="rec-access-main">Access role</Label>
                <Select
                  value={accessChoice}
                  onValueChange={(v) => setAccessChoice(v as InviteAccessChoice)}
                  disabled={submitting}
                >
                  <SelectTrigger id="rec-access-main">
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
                      Name the position, then tick each permission they should have. Presets load HR / Recruiter /
                      Technical Interviewer bundles; you can adjust before sending.
                    </>
                  ) : (
                    accessSummary
                  )}
                </div>
              </div>

              {accessChoice === INVITE_ACCESS_OTHER ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rec-other-title">Position / role name</Label>
                  <Input
                    id="rec-other-title"
                    value={otherRoleTitle}
                    onChange={(e) => setOtherRoleTitle(e.target.value)}
                    placeholder="e.g. VP Talent, Campus Recruiting Lead"
                    disabled={submitting}
                    maxLength={120}
                    required
                  />
                </div>
              ) : null}
            </div>
          </section>

          {accessChoice === INVITE_ACCESS_OTHER ? (
            <section className="w-full min-w-0 space-y-3">
              <Label className="text-base font-semibold">Permissions</Label>
              <InvitePermissionCheckboxes
                value={otherPermissionKeys}
                onChange={setOtherPermissionKeys}
                disabled={submitting}
                idPrefix="admin-invite"
              />
            </section>
          ) : null}

          <div className="flex flex-wrap gap-2">
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
            <Button type="button" variant="outline" disabled={submitting} asChild>
              <Link href="/admin/recruiters">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
