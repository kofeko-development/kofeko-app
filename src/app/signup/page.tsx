
"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";

const toTenantSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

function SignupFormComponent() {
  const { registerAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [tenantName, setTenantName] = useState('Demo Tenant');
  const [tenantSlug, setTenantSlug] = useState(process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? 'demo-tenant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Pre-fill form from query params if they exist
    const nameParam = searchParams.get('name');
    const emailParam = searchParams.get('email');
    if (nameParam) setName(nameParam);
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);


  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const [firstName, ...rest] = name.trim().split(' ');
    const lastName = rest.join(' ') || 'User';

    try {
      await registerAdmin({
        tenantName,
        tenantSlug,
        firstName: firstName || 'Platform',
        lastName,
        email,
        password,
      });

      toast({
        title: "Account Created!",
        description: "Tenant admin account created successfully.",
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Signup Failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-xl">Create Company Admin Account</CardTitle>
        <CardDescription>
          Create a new tenant and admin user.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenant-name">Tenant Name</Label>
            <Input id="tenant-name" value={tenantName} onChange={e => setTenantName(e.target.value)} required disabled={isLoading}/>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenant-slug">Tenant Slug</Label>
            <Input
              id="tenant-slug"
              value={tenantSlug}
              onChange={e => setTenantSlug(toTenantSlug(e.target.value))}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Use lowercase letters, numbers, and hyphens only.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" name="full-name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading}/>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading}/>
          </div>

          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            {isLoading ? "Creating Account..." : "Create an account"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have a company account?{" "}
          <Link href="/login" className="underline">
            Company Login
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          Looking for candidate access? <Link href="/candidate-auth?mode=signup" className="underline">Candidate Sign Up</Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupFormComponent />
        </Suspense>
    )
}
