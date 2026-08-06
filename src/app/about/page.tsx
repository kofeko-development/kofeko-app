import type { Metadata } from 'next';
import PublicNavbar from '@/components/public-navbar';
import CtaBanner from '@/components/cta-banner';
import PublicFooter from '@/components/public-footer';

export const metadata: Metadata = {
  title: 'About Kofeko',
  description:
    'Learn how Kofeko is building a decision-first AI hiring platform that helps growing teams bring clarity and confidence to every hiring decision.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main id="main-content" className="section page-container max-w-4xl pt-32 lg:pt-40">
        <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">
          About Us
        </span>
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Hiring deserves better</h1>
        <div className="prose prose-lg text-slate-600">
          <p className="mb-6">
            Hiring is one of the most important decision a growing company makes. Yet most hiring software still focuses on managing applicants instead of helping teams make better hiring decisions.
          </p>
          <p className="mb-6">
            Kofeko was built to bring structure, clarity and explainable AI to every stage of hiring helping growing teams hire faster with greater confidence.
          </p>
          <br></br>
          <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">
            Our Belief
          </span>
          <h2 className="mb-8 text-3xl font-bold text-slate-900">Hiring deserves better</h2>
          <p>
            Every great hire begins long before the first interview. It starts with understanding the role, evaluating candidates consistently and giving hiring teams the context they need to make confident decisions.
          </p><br></br>
          <p className="mb-6">
            That&apos;s the philosophy behind everything we build at Kofeko.
          </p>
          <br></br>
          <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">
            What We&apos;re Building
          </span>
          <h2 className="mb-8 text-3xl font-bold text-slate-900">More than an ATS</h2>
          <p>
            We&apos;re building an AI-powered Hiring Operating System that helps growing teams define better roles, understand candidates beyond keywords, reduce repetitive work and make confident hiring decisions while keeping you in control.
          </p><br></br>
          <p className="mb-6">

          </p>
        </div>

        {/* Principles Section moved from Home */}
        <section className="mt-20 pt-16 border-t border-slate-100 text-center">
          <h2 className="text-3xl font-bold mb-12">Our Principles</h2>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            <div>
              <h4 className="text-xl font-bold text-primary mb-4">Skills over Keywords</h4>
              <p className="text-slate-600">We prioritize what candidates can actually do, not just the buzzwords on their resumes.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-primary mb-4">Transparency over Mystery</h4>
              <p className="text-slate-600">Recruiters should always know why the AI made a suggestion.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-primary mb-4">Compliance by Design</h4>
              <p className="text-slate-600">Fairness is baked into our code, not just a marketing promise.</p>
            </div>
          </div>
        </section>
      </main>
      <CtaBanner />
      <PublicFooter />
    </div>
  );
}
