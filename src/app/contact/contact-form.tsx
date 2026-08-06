'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ContactInquiry } from '@/lib/lead-forms';

const initialForm: ContactInquiry = { name: '', email: '', companyName: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState<ContactInquiry>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form aria-label="Contact Kofeko" onSubmit={handleSubmit} className="rounded-panel border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="field-label">Name</span>
          <input className="field-control" autoComplete="name" value={form.name} onChange={(event) => { setSubmitted(false); setForm({ ...form, name: event.target.value }); }} required />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="field-label">Work email</span>
          <input className="field-control" type="email" autoComplete="email" value={form.email} onChange={(event) => { setSubmitted(false); setForm({ ...form, email: event.target.value }); }} required />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="field-label">Company name <span className="font-normal text-slate-400">(optional)</span></span>
          <input className="field-control" autoComplete="organization" value={form.companyName} onChange={(event) => { setSubmitted(false); setForm({ ...form, companyName: event.target.value }); }} />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="field-label">How can we help?</span>
          <textarea className="field-textarea" value={form.message} onChange={(event) => { setSubmitted(false); setForm({ ...form, message: event.target.value }); }} required />
        </label>
      </div>
      <Button type="submit" size="lg" className="mt-8 h-14 w-full rounded-full text-lg font-bold shadow-cta">Send message</Button>
      {submitted && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-card bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          Your message is ready for the contact workflow integration.
        </p>
      )}
    </form>
  );
}
