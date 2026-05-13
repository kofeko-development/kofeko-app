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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from '@/lib/firebase-client';

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

  const passwordMismatch =
    mode === 'signup' && confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

        const parts = trimmed.split(/\s+/).filter(Boolean);
        const firstName = parts[0] ?? '';
        const lastName = parts.slice(1).join(' ') || 'Candidate';

        await registerCandidate({ firstName, lastName, email, password });
        toast({ title: 'Candidate account created', description: 'Welcome to Kofeko candidate portal.' });
      } else {
        await loginCandidate({ email, password });
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'signup' ? 'Candidate Sign Up' : 'Candidate Login'}</CardTitle>
          <CardDescription>
            {mode === 'signup' ? 'Create your candidate account.' : 'Login with your candidate account credentials.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            {mode === 'signup' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>

            {mode === 'signup' ? (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
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
                    <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
                {passwordMismatch ? (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                ) : null}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || passwordMismatch}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === 'signup' ? 'Create Candidate Account' : 'Login as Candidate'}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="text-xs text-muted-foreground">OR</div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={onGoogle} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue with Google
          </Button>

          <div className="mt-4 text-center text-sm">
            {mode === 'signup' ? (
              <>
                Already have a candidate account? <Link href="/candidate-auth?mode=login" className="underline">Login</Link>
              </>
            ) : (
              <>
                New here? <Link href="/candidate-auth?mode=signup" className="underline">Create account</Link>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CandidateAuthContent />
    </Suspense>
  );
}
