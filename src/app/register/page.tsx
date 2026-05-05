'use client';

import Link from 'next/link';
import PublicNavbar from '@/components/public-navbar';
import AppFooter from '@/components/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegisterChooserPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <PublicNavbar />
      <main className="flex-1 mt-24 container py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold font-headline text-center">Choose Registration Type</h1>
          <p className="text-center text-muted-foreground mt-2">
            Continue as a company admin or as a candidate account.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mt-10">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle>Register As Company</CardTitle>
                <CardDescription>
                  Create a tenant company and admin account. Existing company users can login with tenant slug.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/signup">Company Sign Up</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Company Login</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Register As Candidate</CardTitle>
                <CardDescription>
                  Create a candidate account to discover jobs, track applications, and receive updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full btn-glass">
                  <Link href="/candidate-auth?mode=signup">Candidate Sign Up</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/candidate-auth?mode=login">Candidate Login</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
