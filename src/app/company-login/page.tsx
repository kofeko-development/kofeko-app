"use client";

import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { showError } = useApiErrorToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters.' });
      return;
    }

    setIsLoading(true);

    try {
      const user = await login({
        email,
        password,
      });
      if (user.status && user.status !== 'active') {
        showError(new Error('This account is currently pending or suspended. Please contact support.'));
        return;
      }

      if (user.role === 'operator') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errorCode === 'APPROVAL_PENDING') {
          router.push('/signup-success?status=pending');
          return;
        }
        if (error.errorCode === 'APPROVAL_REJECTED') {
          router.push('/signup-success?status=rejected');
          return;
        }
      }

      const { fieldErrors: mapped } = showError(error);
      setFieldErrors(mapped);
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  });
                }
              }}
              disabled={isLoading}
              className={cn("h-10", fieldErrors.email && "border-destructive")}
            />
            {fieldErrors.email ? (
              <p className="text-sm text-destructive" role="alert">{fieldErrors.email}</p>
            ) : null}
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
                minLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.password;
                      return next;
                    });
                  }
                }}
                disabled={isLoading}
                className={cn("pr-10 h-10", fieldErrors.password && "border-destructive")}
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
            {fieldErrors.password ? (
              <p className="text-sm text-destructive" role="alert">{fieldErrors.password}</p>
            ) : null}
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
          <Link href="/company-signup" className="underline">
            Company Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
