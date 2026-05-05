
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PublicNavbar from '@/components/public-navbar';
import AppFooter from '@/components/app-footer';
import styles from './home-legacy.module.css';

const featureItems = [
  {
    title: 'Role & JD Structuring',
    body: 'Turn unstructured job descriptions into clear role definitions that reduce false positives before resumes arrive.',
    image: '/static/assets/JD-1.png',
  },
  {
    title: 'Dynamic Shortlisting',
    body: 'Automatically keep shortlists relevant as new candidates enter.',
    image: '/static/assets/Shortlisting.png',
  },
  {
    title: 'Explainable Candidate Summaries',
    body: 'Get a one-page, decision-ready snapshot explaining why a candidate stands out.',
    image: '/static/assets/Resume Understanding.png',
  },
  {
    title: 'Side-by-Side Candidate Comparison',
    body: 'Compare candidates across decision-critical dimensions to reduce bias.',
    image: '/static/assets/Comparision.png',
  },
  {
    title: 'Hiring Momentum Visibility',
    body: 'See where hiring slows down so decisions do not stall silently.',
    image: '/static/assets/hiring visibility.png',
  },
];

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(2);

  return (
    <div className={`flex min-h-screen flex-col ${styles.legacyHome}`} id="home">
      <PublicNavbar />
      <main className="flex-1 mt-20">
        <section className="hero-section">
          <div className="container grid gap-10 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="hero-title">An AI Co-Pilot For Better & Faster Hiring.</h1>
              <h4 className="text-3xl font-semibold">
                <span style={{ color: '#8B5FBF' }}>Kofeko</span> brings clarity to hiring so teams can move forward with confidence.
              </h4>
              <p className="text-lg text-muted-foreground">
                Kofeko helps you take confident hiring decisions by structuring roles, understanding candidates beyond keywords, and removing ambiguity.
              </p>
              <p className="text-lg text-muted-foreground">
                Instead of forcing rigid workflows or black-box scores, Kofeko organizes messy hiring inputs, surfaces decision-critical signals, and keeps shortlists moving.
              </p>
              <div className="flex gap-3">
                <Button asChild className="btn-glass">
                  <Link href="/register">Get Early Access</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center justify-center">
              <img src="/dashboard.svg" alt="Kofeko dashboard preview" className="w-full h-auto rounded-lg hero-dashboard" />
            </div>
          </div>
        </section>

        <section id="features" className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="section-title">Built for Modern Teams</h2>
              <p className="section-subtitle-1">Everything You Need to Transform Recruitment</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <div className="kofeko-accordion">
                {featureItems.map((item, idx) => (
                  <div key={item.title} className="accordion-item">
                    <button type="button" className={`accordion-button ${activeFeature === idx ? 'active' : ''}`} onClick={() => setActiveFeature(idx)}>
                      {item.title}
                    </button>
                    {activeFeature === idx ? <div className="accordion-body">{item.body}</div> : null}
                  </div>
                ))}
              </div>
              <div className="feature-visual-wrapper min-h-[420px] flex items-center justify-center">
                <img src={featureItems[activeFeature].image} alt="Kofeko feature visual" className="feature-visual" />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-new">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle-1">Set up in minutes, personalize your workflow and start hiring</p>
            </div>
            <div className="hiw-grid">
              <div className="hiw-step">
                <div className="hiw-number yellow">01</div>
                <h4>Sign Up</h4>
                <p>Create your workspace and define how you hire.</p>
                <img src="/static/assets/Sign-up.svg" className="hiw-illustration mt-4" alt="Sign up" />
              </div>
              <div className="hiw-step">
                <div className="hiw-number green">02</div>
                <h4>Add a Job Role</h4>
                <p>Kofeko structures your role into a decision-ready blueprint.</p>
                <img src="/static/assets/Add Job.svg" className="hiw-illustration mt-4" alt="Add role" />
              </div>
              <div className="hiw-step">
                <div className="hiw-number coral">03</div>
                <h4>Get Insights</h4>
                <p>Get signals, summaries, and comparisons without keyword bias.</p>
                <img src="/static/assets/Insights-1.svg" className="hiw-illustration mt-4" alt="Insights" />
              </div>
              <div className="hiw-step">
                <div className="hiw-number pink">04</div>
                <h4>Review & Hire</h4>
                <p>Collaborate, compare, and move forward with confidence.</p>
                <img src="/static/assets/review hire.svg" className="hiw-illustration mt-4" alt="Review and hire" />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="section-title">About <span style={{ color: '#8B5FBF' }}>Kofeko</span></h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="text-lg text-muted-foreground space-y-4">
                <p>Kofeko is an AI-powered hiring co-pilot built for startups and SMBs.</p>
                <p>Hiring breaks down because decisions get delayed and signals get lost. Kofeko is designed to fix that.</p>
                <p>Kofeko helps teams structure roles clearly, understand candidates beyond keywords, and surface decision-critical insights.</p>
              </div>
              <div className="flex justify-center">
                <img src="/static/assets/Dashboard-2.png" alt="Kofeko Dashboard Preview" className="about-dashboard" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
