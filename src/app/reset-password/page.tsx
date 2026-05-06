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

const strongPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function ResetPasswordContent() {
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
      toast({ title: 'Missing reset token', description: 'Open this page from the reset email link.', variant: 'destructive' });
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
      await stageOneApi.resetPassword({ token, password });
      toast({ title: 'Password reset successful', description: 'Please login with your new password.' });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Unable to reset password',
        description: error instanceof Error ? error.message : 'Please try again.',
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
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password to complete the reset process.</CardDescription>
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
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Resetting...' : 'Reset Password'}</Button>
          </form>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Back to <Link href="/login" className="underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
