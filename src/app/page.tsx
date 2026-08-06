'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/public-navbar';
import { BookDemoButton } from '@/components/book-demo-button';
import RotatingText from '@/components/rotating-text';
import SystemIllustration from '@/components/system-illustration';
import FeatureCapabilities from '@/components/feature-capabilities';
import FeatureStoryVisual from '@/components/feature-story-visual';
import CtaBanner from '@/components/cta-banner';
import PublicFooter from '@/components/public-footer';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

function dashboardHrefForUser(role: string | undefined) {
  return role === 'operator' ? '/admin/dashboard' : '/dashboard';
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(dashboardHrefForUser(user.role));
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden">
          {/* --- Gradient Background Layer --- */}
          <div className="hero-surface absolute inset-0 z-0">
            {/* Blurred radial gradient blobs */}
            <div className="hero-orb hero-orb--violet absolute -left-32 -top-32 size-[600px] rounded-full opacity-60" />
            <div className="hero-orb hero-orb--rose absolute -right-40 -top-20 size-[500px] rounded-full opacity-50" />
            <div className="hero-orb hero-orb--slate absolute -bottom-32 -left-20 size-[550px] rounded-full opacity-50" />
            <div className="hero-orb hero-orb--center absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70" />
          </div>

          {/* --- Bottom fade to white --- */}
          <div className="hero-fade absolute bottom-0 left-0 right-0 z-[1] h-32" />

          {/* --- Hero Content --- */}
          <div className="section-container text-center max-w-5xl mx-auto relative z-10 pt-32 lg:pt-40">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-primary/15 text-primary text-sm font-semibold mb-6 shadow-sm transition-shadow duration-300 hover:shadow-md cursor-default">
              More Than Just an ATS
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              The AI-Powered Hiring OS Built for{' '}
              <br className="hidden sm:block" />
              <RotatingText />
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
              Structure roles clearly, surface stronger candidates, and make hiring decisions faster all from a single AI-powered hiring platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg font-bold shadow-cta">
                <BookDemoButton>Book a Demo</BookDemoButton>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-primary/20 bg-white/80 px-8 text-lg font-bold text-primary hover:border-primary/40 hover:bg-white hover:text-primary">
                <Link href="/company-signup">Get Early Access</Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-4">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-primary/15 text-primary text-sm font-semibold shadow-sm transition-shadow duration-300 hover:shadow-md cursor-default">
                Smarter Shortlists
              </div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-primary/15 text-primary text-sm font-semibold shadow-sm transition-shadow duration-300 hover:shadow-md cursor-default">
                Transparent AI
              </div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-primary/15 text-primary text-sm font-semibold shadow-sm transition-shadow duration-300 hover:shadow-md cursor-default">
                Faster Decisions
              </div>
            </div>
          </div>
        </section>

        {/* Problem Recognition Section */}
        <section className="section bg-white">
          <div className="page-container">
            <div className="mb-16 md:mb-24 text-center">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">
                Sound Familiar?
              </span>
              <h2 className="text-4xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                The Hiring Problems You&apos;re Tired Of
              </h2>
            </div>

            <div className="grid lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Problem 1 */}
              <div className="py-8 lg:py-0 lg:pr-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Job Description Gaps</h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  A job description shapes who should apply. Small gaps in clarity often lead to the wrong candidate pool.
                </p>
              </div>

              {/* Problem 2 */}
              <div className="py-8 lg:py-0 lg:px-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Resume Overload</h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Good candidates are often buried in a flood of applications, making quality harder to spot.
                </p>
              </div>

              {/* Problem 3 */}
              <div className="py-8 lg:py-0 lg:px-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Feedback Black Holes</h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  When feedback slows down, hiring momentum stalls and candidates are left without answers.
                </p>
              </div>

              {/* Problem 4 */}
              <div className="py-8 lg:py-0 lg:pl-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Hiring Delays</h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Without clear signals, hiring teams keep searching for certainty, delaying decisions and extending time-to-hire.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Meet Kofeko (Bridge Section -- 2) */}
        <section className="bridge-section section relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="bridge-ambient absolute inset-0 pointer-events-none" />

          <div className="page-container relative z-10">

            {/* Top Area */}
            <div className="text-center mb-16 md:mb-24">

              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">
                MEET KOFEKO
              </span>
              <h2 className="text-4xl lg:text-4xl text font-bold text-slate-900 tracking-tight leading-tight">
                Hiring Doesn&apos;t Need Complexity. <br />
                <span className="text-primary">
                  It Needs More Clarity.
                </span>
              </h2>

            </div>

            {/* Main Card */}
            <div
              className="
              relative
              overflow-hidden
              rounded-cta
              border-2
              p-8
              lg:px-16
              lg:py-10
              bridge-card
              "
            >

              {/* Soft Inner Glow */}
              <div className="bridge-inner-glow absolute inset-0 pointer-events-none" />

              {/* Top Right Dot Grid */}
              <div className="bridge-dot-grid bridge-dot-grid--top pointer-events-none absolute right-10 top-10 h-24 w-40" />

              {/* Bottom Left Dot Grid */}
              <div className="bridge-dot-grid bridge-dot-grid--bottom pointer-events-none absolute bottom-10 left-10 h-24 w-40" />

              {/* Decorative Wavy Lines */}
              <svg
                className="absolute bottom-0 right-0 w-[340px] h-[200px] opacity-25 pointer-events-none"
                viewBox="0 0 340 200"
                fill="none"
              >
                <path
                  d="M20 180C80 90 180 90 320 180"
                  stroke="#7e4dfaff"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 200C70 110 170 110 340 200"
                  stroke="#7e4dfaff"
                  strokeWidth="1.5"
                />
                <path
                  d="M60 160C110 70 220 70 340 160"
                  stroke="#7e4dfaff"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Existing Card Glow */}
              <div className="bridge-glow
                  absolute
                  top-1/2
                  left-1/2
                  -translate-x-1/2
                  -translate-y-1/2
                  w-[900px]
                  h-[900px]
                  rounded-full
                  blur-[140px]
                  pointer-events-none
                " />

              <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center min-h-[380px]">

                {/* Left Side */}
                <div className="space-y-8">

                  <div className="space-y-4">

                    <p className="text-xl font-medium text-slate-600">
                      Most hiring tools help you manage candidates.
                    </p>

                    <h3 className="text-3xl lg:text-3xl font-bold text-slate-900 leading-tight">
                      Kofeko helps you make better hiring decisions faster.
                    </h3>

                  </div>

                  <p className="text-lg leading-relaxed text-slate-600 max-w-xl">
                    By automating repetitive work, surfacing stronger candidates,
                    and bringing clarity to every decision, Kofeko help
                    teams
                    hire faster with greater confidence.
                  </p>
                  <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg font-bold shadow-cta">
                    <Link href="/company-signup">Get Early Access</Link>
                  </Button>

                </div>

                {/* Right Side Illustration */}
                <div className="relative flex items-center justify-center min-h-[420px]">

                  <SystemIllustration />

                </div>

              </div>
            </div>
          </div>
        </section>



        {/* 2. Hero Feature List (Snake-Style Journey) */}
        <section className="section bg-white">
          <div className="page-container space-y-32">
            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">

                <h3 className="text-3xl font-bold mb-4">Define Success Before Evaluating Candidates</h3>
                <p className="text-lg text-slate-600 mb-6">

                </p>
                <div className="p-6 rounded-2xl bg-white border shadow-sm">

                  <p className="text-slate-700">Most hiring teams focus on evaluating candidates. The bigger opportunity is creating clarity before applications start arriving.</p>
                  <br></br>
                  <p className="font-semibold text-slate-700">Kofeko turns vague job requirements into structured hiring blueprints that create stronger candidate pools from day one.</p>
                </div>
              </div>
              <div className="order-1 lg:order-2"><FeatureStoryVisual variant="role" /></div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FeatureStoryVisual variant="signals" />
              <div>
                <h3 className="text-3xl font-bold mb-4">Best Candidates Aren&apos;t Always The Loudest</h3>
                <p className="text-lg text-slate-600 mb-6">

                </p>
                <div className="p-6 rounded-2xl bg-white border shadow-sm">
                  <p className="text-slate-700">Keywords, titles and polished resumes rarely tell the full story. Great hiring decisions come from understanding who fits the role, not just who matches the keywords.</p>
                  <br></br>
                  <p className="font-semibold  text-slate-700">Kofeko surfaces context, not just the match score, helping teams understand who stands out and why.</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">

                <h3 className="text-3xl font-bold mb-4">Hiring Moves Faster When Everyone Has Clarity</h3>
                <p className="text-lg text-slate-600 mb-6">

                </p>
                <div className="p-6 rounded-2xl bg-white border shadow-sm">

                  <p className="text-slate-700">Hiring slows down when feedback gets stuck, decisions take longer than expected and momentum fades across the team.</p>
                  <br></br>
                  <p className="font-semibold text-slate-700">Kofeko helps teams move faster by automating repetitive work, collecting and summarizing feedback, highlighting bottlenecks and providing the context needed to make confident hiring decisions.</p>
                </div>
              </div>
              <div className="order-1 lg:order-2"><FeatureStoryVisual variant="momentum" /></div>
            </div>
          </div>
        </section>

        <FeatureCapabilities />

        {/* 5. Differentiation Grid */}
        <section className="section bg-slate-50">
          <div className="page-container">
            <div className="mb-16 md:mb-24 text-center">
              <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">
                BUILT DIFFERENT BY DESIGN
              </span>
              <h2 className="text-4xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Why Modern Teams Choose Kofeko
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <ComparisonColumn
                title="Explainable AI"
                bad="Black-box AI recommendations."
                good="Transparency behind every hiring decision."
              />
              <ComparisonColumn
                title="SMB Design"
                bad="Enterprise bloat & high setup costs."
                good="Lightweight, intuitive and ready from day one."
              />
              <ComparisonColumn
                title="Simplified Hiring"
                bad="Hiring spread across multiple tools."
                good="One structured workflow from role to offer."
              />
            </div>
          </div>
        </section>

        <CtaBanner />
      </main>

      <PublicFooter />
    </div >
  );
}

function ComparisonColumn({ title, bad, good }: { title: string, bad: string, good: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-white border shadow-sm">
      <h4 className="font-bold text-xl mb-8">{title}</h4>
      <div className="space-y-6">
        <div className="flex gap-4">
          <XCircle className="size-6 text-red-400 shrink-0" />
          <p className="text-slate-400">{bad}</p>
        </div>
        <div className="flex gap-4">
          <CheckCircle2 className="size-6 text-primary shrink-0" />
          <p className="font-medium">{good}</p>
        </div>
      </div>
    </div>
  );
}
