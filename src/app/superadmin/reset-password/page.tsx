'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { superadminApi } from '@/lib/superadmin-api';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

const strongPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function SuperAdminResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toastSuccess, toastWarning } = useAppToast();
  const { showError } = useApiErrorToast();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    if (!token) {
      toastWarning({ title: 'Missing reset token', description: 'Open this page from the reset email link.' });
      return;
    }
    if (!strongPassword.test(password)) {
      toastWarning({
        title: 'Weak password',
        description: 'Password must be at least 8 characters with one uppercase letter and one number.',
      });
      return;
    }
    if (password !== confirmPassword) {
      toastWarning({ title: 'Passwords do not match', description: 'Please confirm the same password.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await superadminApi.resetPassword(token, password);
      toastSuccess({ title: 'Password reset successful', description: 'Please log in with your new password.' });
      router.push('/superadmin/login');
    } catch (error) {
      if (error instanceof ApiError && error.errorCode === 'RESET_TOKEN_EXPIRED') {
        showError(error);
        router.push('/superadmin/forgot-password');
        return;
      }
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors(mapped);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Logo className="mb-2" />
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new superadmin password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={cn(fieldErrors.password && 'border-destructive')}
              />
              {fieldErrors.password ? (
                <p className="text-sm text-destructive" role="alert">{fieldErrors.password}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Back to <Link href="/superadmin/login" className="underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuperAdminResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuperAdminResetPasswordContent />
    </Suspense>
  );
}
