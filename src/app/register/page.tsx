'use client';

import Link from 'next/link';
import PublicNavbar from '@/components/public-navbar';
import AppFooter from '@/components/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Building2, LogIn } from 'lucide-react';

export default function RegisterChooserPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <PublicNavbar />
      <main className="flex-1 mt-24 container py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-headline tracking-tight">Get started with Kofeko</h1>
            <p className="text-center text-muted-foreground mt-2">
              Choose the account type you want to use. You can always switch later.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-10">
            <Card className="relative overflow-hidden border-primary/30">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Company account
                </CardTitle>
                <CardDescription className="mt-2">
                  For hiring teams. Manage jobs, applicants, interviews, and your company profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Post & manage job openings</li>
                  <li>- Review applicants and track stages</li>
                  <li>- Manage company & team settings</li>
                </ul>
                <div className="pt-2 grid gap-2">
                  <Button asChild className="w-full">
                    <Link href="/signup">
                      Create company account <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      I already have an account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-muted/40 via-transparent to-transparent" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Candidate account
                </CardTitle>
                <CardDescription className="mt-2">
                  For job seekers. Apply to roles, track applications, and keep your profile updated.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Discover and apply to jobs</li>
                  <li>- Track your application status</li>
                  <li>- Keep your resume & skills updated</li>
                </ul>
                <div className="pt-2 grid gap-2">
                  <Button asChild className="w-full">
                    <Link href="/candidate-auth?mode=signup">
                      Create candidate account <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/candidate-auth?mode=login">
                      <LogIn className="mr-2 h-4 w-4" />
                      I already have an account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Need help? Go to <Link className="underline" href="/about">About</Link> or start from the{' '}
            <Link className="underline" href="/">Home</Link> page.
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
