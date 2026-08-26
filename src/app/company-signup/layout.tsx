import React from 'react';
import type { Metadata } from 'next';
import { LineChart, BrainCircuit, Zap } from 'lucide-react';

import AuthLegalTags from '@/components/auth-legal-tags';
import Logo from '@/components/logo';

export const metadata: Metadata = {
  title: {
    template: '%s | Kofeko',
    default: 'Company account',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompanyAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-1 flex-col md:flex-row">
      
      {/* Left Side: Auth Form Container */}
      <main id="main-content" className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8 lg:p-24 relative bg-white z-10 order-2 md:order-1 pt-12 lg:pt-24">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="absolute top-8 left-8">
          <Logo href="/" />
        </div>
        
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </main>

      {/* Right Side: Visual Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 relative overflow-hidden bg-slate-900 text-white flex-col justify-center p-12 lg:p-16 order-1 md:order-2 pt-24">
        
        {/* Background Gradients & Glows */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-slate-900 to-slate-900 opacity-60" />
          <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
        </div>
        
        {/* Center Content */}
        <div className="relative z-10 max-w-md my-auto mx-auto w-full">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-8">
            The intelligent <br />
            <span className="text-primary-foreground/90 font-light">Hiring OS.</span>
          </h1>
          
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="mt-1 size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <BrainCircuit className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Candidate Intelligence</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Go beyond keywords with semantic ranking and conversational screening.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="mt-1 size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <LineChart className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Hiring Analytics</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Real-time pipeline insights and automated reports for every stakeholder.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="mt-1 size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Zap className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Platform Intelligence</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Automate the busywork. Focus on the human connections that matter.</p>
              </div>
            </div>
          </div>
        </div>
        <AuthLegalTags />
        
      </div>
      </div>
    </div>
  );
}
