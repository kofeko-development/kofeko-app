
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
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { allUsers } from "@/lib/admin-data";

function SignupFormComponent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

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


  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const existingUser = allUsers.find(u => u.email === email && u.status === 'active');
    if (existingUser) {
        toast({
            title: 'Account Already Exists',
            description: `An active ${existingUser.role} account with this email already exists. Please log in.`,
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }
    
    setTimeout(() => {
        const newCandidate: User = {
            uid: `candidate-${Date.now()}`,
            name,
            email,
            role: 'candidate',
            status: 'active'
        };
        allUsers.push(newCandidate); 
        login(newCandidate);

        toast({
            title: "Account Created!",
            description: "Welcome to Kofeko! Please complete your profile to continue.",
        });

        router.push('/profile');

    }, 1500);

  };

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-xl">Create your Applicant Profile</CardTitle>
        <CardDescription>
         New Applicant? Create your account here to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="grid gap-4">
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
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
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
