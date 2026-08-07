'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth';
import { useAppToast } from '@/lib/toast-helpers';

import { useApiErrorToast } from '@/hooks/use-api-error-toast';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from '@/lib/firebase-client';
import { apiRequest } from '@/lib/api-client';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthGoogleButton } from '@/components/auth/AuthGoogleButton';
import { AuthPortalSwitcher } from '@/components/auth/AuthPortalSwitcher';

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const isValidEmailShape = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

const getSafeRedirect = (url: string | null) => {
  if (!url) return '/find-jobs';
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return '/find-jobs';
};

function CandidateAuthContent() {
  const { loginCandidate, loginCandidateWithGoogle, registerCandidate } = useAuth();
  const { toastSuccess, toastWarning, toastInfo } = useAppToast();
  const { showError } = useApiErrorToast();
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const mode = useMemo(() => (searchParams.get('mode') === 'signup' ? 'signup' : 'login'), [searchParams]);
  const redirectPath = useMemo(() => getSafeRedirect(searchParams.get('redirect')), [searchParams]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null);
  const [verifiedAtEmail, setVerifiedAtEmail] = useState<string | null>(null);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [confirmOtpLoading, setConfirmOtpLoading] = useState(false);

  const passwordMismatch =
    mode === 'signup' && confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword;

  const emailLooksVerified =
    Boolean(emailVerificationToken) &&
    verifiedAtEmail !== null &&
    verifiedAtEmail === normalizeEmail(email);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (verifiedAtEmail && normalizeEmail(value) !== verifiedAtEmail) {
      setVerifiedAtEmail(null);
      setEmailVerificationToken(null);
      setOtpCode('');
      setOtpSent(false);
    }
  };

  const handleSendOtp = async () => {
    const raw = email.trim();
    if (!isValidEmailShape(raw)) {
      toastWarning({ title: 'Invalid email', description: 'Enter a valid email address.' });
      return;
    }
    setSendOtpLoading(true);
    try {
      await apiRequest<{ sent: true }>('/auth/candidate-signup-email-otp/send', {
        method: 'POST',
        body: { email: raw },
      });
      setOtpSent(true);
      setOtpCode('');
      setVerifiedAtEmail(null);
      setEmailVerificationToken(null);
      toastInfo({ title: 'Code sent', description: 'Check your email for a 6-digit verification code.' });
    } catch (error) {
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors((prev) => ({ ...prev, ...mapped }));
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    const raw = email.trim();
    const code = otpCode.trim();
    if (!isValidEmailShape(raw) || !/^\d{6}$/.test(code)) {
      toastWarning({ title: 'Invalid code', description: 'Enter the 6-digit code from your email.' });
      return;
    }
    setConfirmOtpLoading(true);
    try {
      const { emailVerificationToken: token } = await apiRequest<{ emailVerificationToken: string }>(
        '/auth/candidate-signup-email-otp/verify',
        { method: 'POST', body: { email: raw, code } },
      );
      setEmailVerificationToken(token);
      setVerifiedAtEmail(normalizeEmail(raw));
      toastSuccess({ title: 'Email verified', description: 'Creating your account...' });

      const trimmed = fullName.trim();
      if (trimmed && password && password === confirmPassword) {
        setIsLoading(true);
        const parts = trimmed.split(/\s+/).filter(Boolean);
        const firstName = parts[0] ?? '';
        const lastName = parts.slice(1).join(' ') || 'Candidate';

        await registerCandidate({
          firstName,
          lastName,
          email: normalizeEmail(raw),
          password,
          emailVerificationToken: token
        });
        toastSuccess({ title: 'Account created', description: 'Welcome to Kofeko!' });
        router.push(redirectPath);
      }
    } catch (error) {
      const { fieldErrors: mapped } = showError(error);
      setFieldErrors((prev) => ({ ...prev, ...mapped }));
      setIsLoading(false);
    } finally {
      setConfirmOtpLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !emailLooksVerified) {
      handleSendOtp();
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const trimmed = fullName.trim();
        if (!trimmed) {
          throw new Error('Please enter your name.');
        }

        if (!termsAccepted) {
          throw new Error('You must agree to the Terms and Conditions to register.');
        }

        if (!emailVerificationToken) {
          throw new Error('Please verify your email first.');
        }

        const parts = trimmed.split(/\s+/).filter(Boolean);
        const firstName = parts[0] ?? '';
        const lastName = parts.slice(1).join(' ') || 'Candidate';

        await registerCandidate({
          firstName,
          lastName,
          email: normalizeEmail(email),
          password,
          emailVerificationToken
        });
        toastSuccess({ title: 'Candidate account created', description: 'Welcome to Kofeko candidate portal.' });
      } else {
        await loginCandidate({ email: normalizeEmail(email), password });
        toastSuccess({ title: 'Login successful', description: 'Welcome back.' });
      }
      router.push(redirectPath);
    } catch (error: any) {
      const isEmailNotFound = error?.errorCode === 'EMAIL_NOT_FOUND';
      const overrides: any = {};

      if (isEmailNotFound && mode === 'login') {
        overrides.action = 'Register as candidate';
        overrides.actionHref = '/candidate-auth?mode=signup';
      }

      const { fieldErrors: mapped } = showError(error, overrides);
      setFieldErrors(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const cred = await signInWithPopup(firebaseAuth, googleAuthProvider);
      const idToken = await cred.user.getIdToken();
      await loginCandidateWithGoogle({ idToken });
      toastSuccess({ title: 'Login successful', description: 'Signed in with Google.' });
      router.push(redirectPath);
    } catch (error: any) {
      const isEmailNotFound = error?.errorCode === 'EMAIL_NOT_FOUND';
      const overrides: any = {};

      if (isEmailNotFound && mode === 'login') {
        overrides.action = 'Register as candidate';
        overrides.actionHref = '/candidate-auth?mode=signup';
      }

      const { fieldErrors: mapped } = showError(error, overrides);
      setFieldErrors(mapped);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <AuthPortalSwitcher active="candidate" />

      <div className="mb-10 text-center md:text-left">
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
          {mode === 'signup' ? 'Candidate Sign Up' : 'Candidate Login'}
        </h2>
        <p className="text-sm text-slate-500">
          {mode === 'signup' ? 'Create your account to start applying.' : 'Login with your candidate account credentials.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {mode === 'signup' && (
          <AuthInput
            id="name"
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading || isGoogleLoading || emailLooksVerified}
          />
        )}

        <div className="grid gap-2">
          <div className="relative">
            <AuthInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading || emailLooksVerified}
              className={cn(
                emailLooksVerified && "border-emerald-500/50 bg-emerald-50/30 text-emerald-900 pr-10",
                (fieldErrors.email || fieldErrors.adminEmail) && !emailLooksVerified && "border-destructive",
              )}
            />
            {emailLooksVerified && (
              <CheckCircle2 className="absolute right-3 top-[38px] h-5 w-5 text-emerald-500" />
            )}
          </div>
          {(fieldErrors.email || fieldErrors.adminEmail) ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.email ?? fieldErrors.adminEmail}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <div className="relative z-10 mb-[-12px] flex items-center justify-between pointer-events-none">
            <span className="opacity-0">Password</span>
            {mode === 'login' ? (
              <Link
                href="/forgot-password?from=candidate"
                className="pointer-events-auto bg-white pr-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Forgot password?
              </Link>
            ) : null}
          </div>
          <AuthInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || isGoogleLoading}
            className={cn(fieldErrors.password && "border-destructive")}
          />
          {fieldErrors.password ? (
            <p className="text-sm text-destructive" role="alert">{fieldErrors.password}</p>
          ) : null}
        </div>

        {mode === 'signup' && (
          <div className="grid gap-2">
            <AuthInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || isGoogleLoading}
            />
            {passwordMismatch ? (
              <p className="text-sm text-destructive">Passwords do not match.</p>
            ) : null}
          </div>
        )}

        {mode === 'signup' && otpSent && !emailLooksVerified && (
          <div className="mt-2 grid gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center justify-between px-0.5">
              <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-primary">Enter 6-Digit Code</Label>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-primary/70 hover:text-primary"
                onClick={handleSendOtp}
                disabled={sendOtpLoading}
              >
                Resend Code
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                id="otp"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="h-11 rounded-xl border-primary/20 bg-white text-center font-mono text-lg tracking-[0.4em] focus-visible:ring-primary/30"
                maxLength={6}
                disabled={confirmOtpLoading}
              />
              <Button
                type="button"
                onClick={handleConfirmOtp}
                disabled={confirmOtpLoading || otpCode.length !== 6}
                className="h-11 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary/90"
              >
                {confirmOtpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
              </Button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              disabled={isLoading || isGoogleLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the <Link href="/terms" className="text-primary hover:underline" target="_blank">Terms and Conditions</Link> and <Link href="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>. *
            </label>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
            disabled={isLoading || isGoogleLoading || sendOtpLoading || confirmOtpLoading || (mode === 'signup' && passwordMismatch)}
          >
            {isLoading || sendOtpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === 'signup'
              ? (emailLooksVerified ? 'Create Account' : 'Continue')
              : 'Login as Candidate'}
          </Button>
        </div>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Or</span>
        </div>
      </div>

      <AuthGoogleButton
        onClick={onGoogle}
        disabled={isLoading || isGoogleLoading || sendOtpLoading || confirmOtpLoading}
      >
        {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </AuthGoogleButton>

      <div className="mt-10 text-center text-sm text-slate-500">
        {mode === 'signup' ? (
          <>
            Already have a candidate account? <Link href="/candidate-auth?mode=login" className="font-semibold text-primary transition-colors hover:text-primary/80">Login</Link>
          </>
        ) : (
          <>
            New to Kofeko? <Link href="/candidate-auth?mode=signup" className="font-semibold text-primary transition-colors hover:text-primary/80">Create account</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function CandidateAuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CandidateAuthContent />
    </Suspense>
  );
}
