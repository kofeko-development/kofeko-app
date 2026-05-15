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
  /** After 409, company slug becomes required for the next attempt. */
  const [slugRequired, setSlugRequired] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const slug = tenantSlug.trim();
      const user = await login({
        email,
        password,
        tenantSlug: slug || undefined,
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
      if (error instanceof ApiError) {
        // 409 — multiple accounts: show tenant slug field
        if (error.status === 409 || error.errorCode === 'CONFLICT') {
          setSlugRequired(true);
          toast({
            title: 'Multiple Company Accounts',
            description: 'Multiple accounts found for this email. Please enter your company slug to continue.',
            variant: 'destructive',
          });
          return;
        }

        // Pending approval — specific screen
        if (error.errorCode === 'APPROVAL_PENDING') {
          toast({
            title: 'Registration Pending',
            description: 'Your company registration is awaiting approval. You will receive an email when approved.',
            variant: 'destructive',
          });
          return;
        }

        // Rejected — specific message
        if (error.errorCode === 'APPROVAL_REJECTED') {
          toast({
            title: 'Registration Not Approved',
            description: 'Your company registration was not approved. Contact support@kofeko.ai.',
            variant: 'destructive',
          });
          return;
        }

        // Tenant suspended
        if (error.errorCode === 'TENANT_SUSPENDED') {
          toast({
            title: 'Account Suspended',
            description: 'This company account has been suspended. Contact support@kofeko.ai.',
            variant: 'destructive',
          });
          return;
        }

        // Individual user suspended
        if (error.errorCode === 'USER_SUSPENDED') {
          toast({
            title: 'Account Suspended',
            description: 'Your account has been suspended. Contact your company admin.',
            variant: 'destructive',
          });
          return;
        }

        // Invited but not accepted
        if (error.errorCode === 'ACCOUNT_INVITED_ONLY') {
          toast({
            title: 'Accept Your Invite First',
            description: 'Please click the invite link in your email to activate your account.',
            variant: 'destructive',
          });
          return;
        }

        // Wrong portal (candidate trying staff login)
        if (error.errorCode === 'WRONG_PORTAL') {
          toast({
            title: 'Wrong Login Page',
            description: 'This email is a candidate account. Use the candidate login instead.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Default fallback
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
          <div className="grid gap-2">
            <Label htmlFor="tenantSlug">Company slug {slugRequired ? '(required)' : '(optional)'}</Label>
            <Input
              id="tenantSlug"
              placeholder="your-company-slug"
              required={slugRequired}
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              disabled={isLoading}
              autoComplete="organization"
            />
            <p className="text-xs text-muted-foreground">
              Use this if your admin gave you a slug, or if login says multiple accounts were found for your email.
            </p>
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
