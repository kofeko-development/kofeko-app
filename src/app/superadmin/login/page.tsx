'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppToast } from '@/lib/toast-helpers';
import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import Logo from '@/components/logo';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { toastSuccess } = useAppToast();
  const { showError } = useApiErrorToast();
  const { loginSuperAdmin, completeSuperAdminLogin2FA } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submittingRef = useRef(false);

  const finishLogin = () => {
    toastSuccess({ title: 'Login successful', description: 'Welcome, super admin.' });
    router.push('/superadmin/dashboard');
  };

  const onSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsLoading(true);
    setFieldErrors({});

    try {
      const result = await loginSuperAdmin({ email: email.trim(), password });
      if (result.requiresTwoFactor) {
        setPendingToken(result.pendingToken);
        setStep('2fa');
      } else {
        finishLogin();
      }
    } catch (error) {
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors(mapped);
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };

  const onSubmit2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken || submittingRef.current) return;
    submittingRef.current = true;
    setIsLoading(true);
    setFieldErrors({});

    try {
      await completeSuperAdminLogin2FA(pendingToken, twoFactorCode.replace(/\s/g, ''));
      finishLogin();
    } catch (error) {
      showError(error);
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };

  const backToCredentials = () => {
    setStep('credentials');
    setPendingToken(null);
    setTwoFactorCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Logo className="mb-2" />
          <CardTitle>Superadmin Login</CardTitle>
          <CardDescription>
            {step === 'credentials'
              ? 'Sign in to review and approve company registration requests.'
              : 'Enter the 6-digit code from your authenticator app or a backup code.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'credentials' ? (
            <form onSubmit={onSubmitCredentials} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className={cn(fieldErrors.email && 'border-destructive')}
                />
                {fieldErrors.email ? (
                  <p className="text-sm text-destructive" role="alert">{fieldErrors.email}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/superadmin/forgot-password" className="text-xs underline text-muted-foreground hover:text-primary">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className={cn('pr-10', fieldErrors.password && 'border-destructive')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="text-sm text-destructive" role="alert">{fieldErrors.password}</p>
                ) : null}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={onSubmit2FA} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="twoFactorCode">Authentication code</Label>
                <Input
                  id="twoFactorCode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000000"
                  required
                  disabled={isLoading}
                  maxLength={16}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
              <Button type="button" variant="ghost" onClick={backToCredentials} disabled={isLoading}>
                Back to sign in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
