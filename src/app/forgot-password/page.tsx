'use client';

import Link from 'next/link';
import { FormEvent, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { stageOneApi } from '@/lib/stage1-2-api';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

function ForgotPasswordContent() {
  const { toastInfo } = useAppToast();
  const { showError } = useApiErrorToast();
  const searchParams = useSearchParams();
  const isCandidate = searchParams?.get('from') === 'candidate';
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    try {
      setIsSubmitting(true);
      await stageOneApi.forgotPassword({ email: email.trim().toLowerCase() });
      toastInfo({
        title: 'Reset email sent',
        description: 'If your account exists, you will receive a password reset email shortly.',
      });
    } catch (error) {
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors(mapped);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Logo className="mb-2" />
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a reset link for your {isCandidate ? 'candidate profile' : 'account'}.
        </CardDescription>
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
              placeholder={isCandidate ? "you@example.com" : "you@company.com"}
              className={cn(fieldErrors.email && 'border-destructive')}
            />
            {fieldErrors.email ? (
              <p className="text-sm text-destructive" role="alert">{fieldErrors.email}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</Button>
        </form>
        <p className="mt-4 text-sm text-center text-muted-foreground">
          Back to{' '}
          <Link href={isCandidate ? "/candidate-auth?mode=login" : "/company-login"} className="underline hover:text-primary">
            {isCandidate ? "Candidate Login" : "Login"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/20">
      <Suspense fallback={<Card className="w-full max-w-md p-6 text-center text-muted-foreground">Loading...</Card>}>
        <ForgotPasswordContent />
      </Suspense>
    </div>
  );
}
