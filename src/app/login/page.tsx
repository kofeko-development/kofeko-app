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
import { allUsers } from "@/lib/admin-data";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, this would be an API call to your backend.
    // Here, we simulate checking credentials against our mock user data.
    setTimeout(() => {
        const user = allUsers.find(u => u.email === email);

        if (user) {
            // In a real app, you'd also verify the password.
            if (user.status !== 'active') {
                toast({
                    title: 'Account Not Active',
                    description: 'This account is currently pending or suspended. Please contact support.',
                    variant: 'destructive'
                });
                setIsLoading(false);
                return;
            }
            
            login(user);
            
            if (user.role === 'operator') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }
        } else {
            toast({
                title: 'Login Failed',
                description: 'Invalid email or password. Please try again.',
                variant: 'destructive'
            });
            setIsLoading(false);
        }
    }, 1000);
  };


  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email and password below to access your account.
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
              <Link href="#" className="ml-auto inline-block text-sm underline">
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
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                </>
              ) : (
                'Login'
              )}
          </Button>

        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
