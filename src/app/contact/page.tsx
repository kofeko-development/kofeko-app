import PublicNavbar from '@/components/public-navbar';
import PublicFooter from '@/components/public-footer';
import Link from 'next/link';
import { CalendarDays, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import ContactForm from './contact-form';

export const metadata: Metadata = {
  title: 'Contact Kofeko',
  description:
    'Contact Kofeko to discuss an AI hiring platform for your startup or small business in India.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <main id="main-content" className="section pt-32 lg:pt-40">
        <div className="page-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <span className="mb-4 block text-sm font-bold uppercase tracking-wider text-primary">Contact Kofeko</span>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">Start a conversation with our team.</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">Tell us how we can help and we’ll route your message to the right person.</p>
          </div>
          <ContactForm />
        </div>

        <section aria-labelledby="contact-details-heading" className="page-container mt-20 border-t border-slate-200 pt-12 lg:mt-28 lg:pt-16">
          <div className="max-w-2xl">
            <span className="mb-3 block text-sm font-bold uppercase tracking-wider text-primary">Contact details</span>
            <h2 id="contact-details-heading" className="text-3xl font-bold tracking-tight text-slate-900">Prefer to reach us directly?</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
              <MessageCircle className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-bold text-slate-900">General enquiries</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">For product, partnership, and platform questions, send us a message through the form above.</p>
              <a href="mailto:Info@kofeko.com" className="mt-4 inline-flex rounded-control text-sm font-bold text-primary hover:text-primary/80">Info@kofeko.com</a>
            </div>
            <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
              <CalendarDays className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-bold text-slate-900">Demo scheduling</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Want to see Kofeko in your hiring workflow? Choose a preferred demo window.</p>
              <Link href="/book-demo" className="mt-4 inline-flex rounded-control text-sm font-bold text-primary hover:text-primary/80">Book a demo →</Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
