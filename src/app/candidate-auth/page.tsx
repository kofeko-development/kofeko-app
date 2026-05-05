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
import { Loader2 } from 'lucide-react';

function CandidateAuthContent() {
  const { loginCandidate, registerCandidate } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = useMemo(() => (searchParams.get('mode') === 'signup' ? 'signup' : 'login'), [searchParams]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await registerCandidate({ firstName, lastName, email, password });
        toast({ title: 'Candidate account created', description: 'Welcome to Kofeko candidate portal.' });
      } else {
        await loginCandidate({ email, password });
        toast({ title: 'Login successful', description: 'Welcome back.' });
      }
      router.push('/dashboard');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
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
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
                </div>
              </>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === 'signup' ? 'Create Candidate Account' : 'Login as Candidate'}
            </Button>
          </form>

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
          <div className="mt-2 text-center text-sm">
            <Link href="/register" className="underline text-muted-foreground">Back to registration options</Link>
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
