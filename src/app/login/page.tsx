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
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [tenantSlug, setTenantSlug] = useState('');
  const [showTenantSlug, setShowTenantSlug] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({ email, password, tenantSlug: showTenantSlug ? tenantSlug : undefined });
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
        setShowTenantSlug(true);
        toast({
          title: 'Multiple company accounts found',
          description: 'Please enter your company slug to continue.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Company Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your company account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          {showTenantSlug ? (
            <div className="grid gap-2">
              <Label htmlFor="tenantSlug">Company Slug</Label>
              <Input
                id="tenantSlug"
                placeholder="your-company-slug"
                required
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Ask your admin for the company slug if you don't know it.</p>
            </div>
          ) : null}
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
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button asChild variant="outline" className="w-full sm:flex-1">
              <Link href="/register">Register</Link>
            </Button>
            <Button type="submit" className="w-full sm:flex-1" disabled={isLoading}>
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
        <div className="mt-2 text-center text-sm">
          Candidate user? <Link href="/candidate-auth?mode=login" className="underline">Login as Candidate</Link>
        </div>
        <div className="mt-2 text-center text-sm">
          Got an invite? <Link href="/accept-invite" className="underline">Accept invite</Link>
        </div>
      </CardContent>
    </Card>
  )
}
