"use client";

import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({
        email,
        password,
      });
      if (user.status && user.status !== 'active') {
        toast({
          title: 'Account Not Active',
          description: 'This account is currently pending or suspended. Please contact support.',
          variant: 'destructive',
        });
        return;
      }

      if (user.role === 'operator') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast({
          title: 'Multiple company accounts found',
          description: 'Please contact support to resolve account ambiguity.',
          variant: 'destructive',
        });
        return;
      }

      if (error instanceof ApiError && error.errorCode === 'REGISTRATION_PENDING') {
        router.push('/signup-success');
        return;
      }
      const hint401 = '';
      toast({
        title: 'Login Failed',
        description:
          (error instanceof Error ? error.message : 'Invalid email or password. Please try again.') + hint401,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="mx-auto max-w-sm w-full shadow-lg border-primary/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Company Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your company account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-10"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="ml-auto inline-block text-xs underline text-muted-foreground hover:text-primary transition-colors">
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10 h-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
          </div>


          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </div>

        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have a company account?{" "}
          <Link href="/signup" className="underline">
            Company Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
