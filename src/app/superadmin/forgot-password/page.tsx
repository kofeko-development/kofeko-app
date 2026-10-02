'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { superadminApi } from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

export default function SuperAdminForgotPasswordPage() {
  const { toastInfo } = useAppToast();
  const { showError } = useApiErrorToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    try {
      setIsSubmitting(true);
      await superadminApi.forgotPassword(email.trim().toLowerCase());
      toastInfo({
        title: 'Reset email sent',
        description: 'If that email exists, you will receive a password reset email shortly.',
      });
    } catch (error) {
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
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your superadmin email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className={cn(fieldErrors.email && 'border-destructive')}
              />
              {fieldErrors.email ? (
                <p className="text-sm text-destructive" role="alert">{fieldErrors.email}</p>
              ) : null}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
