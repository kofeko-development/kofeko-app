'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from '@/lib/firebase-client';
import { apiRequest } from '@/lib/api-client';

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const isValidEmailShape = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

function CandidateAuthContent() {
  const { loginCandidate, loginCandidateWithGoogle, registerCandidate } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = useMemo(() => (searchParams.get('mode') === 'signup' ? 'signup' : 'login'), [searchParams]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // OTP State
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
      toast({ title: 'Invalid email', description: 'Enter a valid email address.', variant: 'destructive' });
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
      toast({ title: 'Code sent', description: 'Check your email for a 6-digit verification code.' });
    } catch (error) {
      toast({
        title: 'Could not send code',
        description: error instanceof Error ? error.message : 'Try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    const raw = email.trim();
    const code = otpCode.trim();
    if (!isValidEmailShape(raw) || !/^\d{6}$/.test(code)) {
      toast({ title: 'Invalid code', description: 'Enter the 6-digit code from your email.', variant: 'destructive' });
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
      toast({ title: 'Email verified', description: 'Creating your account...' });

      // Automatically attempt to complete signup if fields are filled
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
        toast({ title: 'Account created', description: 'Welcome to Kofeko!' });
        router.push('/find-jobs');
      }
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Check the code and try again.',
        variant: 'destructive',
      });
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
    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const trimmed = fullName.trim();
        if (!trimmed) {
          throw new Error('Please enter your name.');
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
        toast({ title: 'Candidate account created', description: 'Welcome to Kofeko candidate portal.' });
      } else {
        await loginCandidate({ email: normalizeEmail(email), password });
        toast({ title: 'Login successful', description: 'Welcome back.' });
      }
      router.push('/find-jobs');
    } catch (error) {
      toast({
        title: mode === 'signup' ? 'Candidate signup failed' : 'Candidate login failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
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
      toast({ title: 'Login successful', description: 'Signed in with Google.' });
      router.push('/find-jobs');
    } catch (error) {
      toast({
        title: 'Google sign-in failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 relative">
      <div className="absolute top-6 right-6 text-sm">
        Are you a company? <Link href="/login" className="underline font-medium">Login here</Link>
      </div>
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {mode === 'signup' ? 'Candidate Sign Up' : 'Candidate Login'}
          </CardTitle>
          <CardDescription>
            {mode === 'signup' ? 'Create your account to start applying.' : 'Login with your candidate account credentials.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            {mode === 'signup' && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading || isGoogleLoading || emailLooksVerified}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  disabled={isLoading || isGoogleLoading || emailLooksVerified}
                  className={emailLooksVerified ? "pr-10 border-emerald-500/50 bg-emerald-50/30" : ""}
                />
                {emailLooksVerified && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLoading || isGoogleLoading}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    disabled={isLoading || isGoogleLoading}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordMismatch ? (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                ) : null}
              </div>
            )}

            {mode === 'signup' && otpSent && !emailLooksVerified && (
              <div className="grid gap-2 p-3 mt-1 rounded-md border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex items-center justify-between px-0.5">
                  <Label htmlFor="otp" className="text-[11px] font-bold uppercase tracking-wider text-primary/70">Enter 6-Digit Code</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-[10px] text-muted-foreground hover:text-primary"
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
                    className="text-center tracking-[0.4em] font-mono text-sm h-9 border-primary/20 focus-visible:ring-primary/30"
                    maxLength={6}
                    disabled={confirmOtpLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleConfirmOtp}
                    disabled={confirmOtpLoading || otpCode.length !== 6}
                    size="sm"
                    className="h-9 px-4 font-medium"
                  >
                    {confirmOtpLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 mt-2 text-base font-semibold transition-all duration-200 shadow-sm"
              disabled={isLoading || isGoogleLoading || sendOtpLoading || confirmOtpLoading || (mode === 'signup' && passwordMismatch)}
            >
              {isLoading || sendOtpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === 'signup'
                ? (emailLooksVerified ? 'Create Account' : 'Continue')
                : 'Login as Candidate'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2">OR</div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="w-full h-11 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
            onClick={onGoogle}
            disabled={isLoading || isGoogleLoading || sendOtpLoading || confirmOtpLoading}
          >
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signup' ? (
              <>
                Already have a candidate account? <Link href="/candidate-auth?mode=login" className="underline hover:text-primary font-medium">Login</Link>
              </>
            ) : (
              <>
                New to Kofeko? <Link href="/candidate-auth?mode=signup" className="underline hover:text-primary font-medium">Create account</Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CandidateAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>}>
      <CandidateAuthContent />
    </Suspense>
  );
}
