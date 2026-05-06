'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { stageOneApi } from '@/lib/stage1-2-api';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [tenantSlug, setTenantSlug] = useState(process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? '');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await stageOneApi.forgotPassword({ tenantSlug, email });
      toast({
        title: 'Reset email sent',
        description: 'If your account exists, you will receive a password reset email shortly.',
      });
    } catch (error) {
      toast({
        title: 'Unable to process request',
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
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your tenant slug and email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="tenantSlug">Tenant Slug</Label>
              <Input id="tenantSlug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</Button>
          </form>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Back to <Link href="/login" className="underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
