'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { stageOneApi } from '@/lib/stage1-2-api';
import { ApiError } from '@/lib/api-client';

const strongPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast({ title: 'Missing invite token', description: 'Open this page from the invite email link.', variant: 'destructive' });
      return;
    }
    if (!strongPassword.test(password)) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 8 characters with one uppercase letter and one number.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please confirm the same password.', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      await stageOneApi.acceptInvite({ token, password });
      toast({ title: 'Invite accepted', description: 'Your account is active now. Please login.' });
      router.push('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errorCode === 'INVITE_TOKEN_EXPIRED') {
          toast({
            title: 'Invite Link Expired',
            description: 'This invite link has expired (72 hours). Ask your admin to send a new invitation.',
            variant: 'destructive',
          });
          return;
        }
        if (error.errorCode === 'INVITE_TOKEN_USED') {
          toast({
            title: 'Already Activated',
            description: 'This invite link has already been used. Try logging in with your email.',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }
        if (error.errorCode === 'INVITE_TOKEN_INVALID') {
          toast({
            title: 'Invalid Invite Link',
            description: 'This link is not valid. Ask your admin to resend the invitation.',
            variant: 'destructive',
          });
          return;
        }
      }
      toast({
        title: 'Could Not Activate Account',
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invite</CardTitle>
          <CardDescription>Set your account password to activate your team invite.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Activating...' : 'Activate Account'}</Button>
          </form>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Already active? <Link href="/login" className="underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
