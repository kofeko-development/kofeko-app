import React from 'react';
import type { Metadata } from 'next';
import { Sparkles, Map, Target } from 'lucide-react';

import AuthLegalTags from '@/components/auth-legal-tags';

export const metadata: Metadata = {
  title: {
    template: '%s | Kofeko',
    default: 'Candidate account',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CandidateAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex flex-1 flex-col md:flex-row">
      {/* Left Side: Visual Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 relative overflow-hidden bg-slate-900 text-white flex-col justify-center p-12 lg:p-16 pt-24">
        
        {/* Background Gradients & Glows */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/40 via-slate-900 to-slate-900 opacity-60" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
        </div>
        
        {/* Center Content */}
        <div className="relative z-10 max-w-md my-auto mx-auto w-full">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-8">
            Your career, <br />
            <span className="text-primary-foreground/90 font-light">amplified by AI.</span>
          </h1>
          
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="mt-1 size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Target className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Discover Opportunities</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Match with roles based on your true skills and potential, not just your past job titles.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="mt-1 size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Map className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Track Applications</h3>
                <p className="text-slate-400 text-sm leading-relaxed">No more black holes. Get clear updates and AI-driven feedback at every stage.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="mt-1 size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Sparkles className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">One Global Profile</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Maintain one unified profile to effortlessly apply across thousands of partner companies.</p>
              </div>
            </div>
          </div>
        </div>
        <AuthLegalTags />
        
      </div>
      
      {/* Right Side: Auth Form Container */}
      <main id="main-content" className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8 lg:p-24 relative bg-white pt-12 lg:pt-24">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="absolute top-8 left-8 md:hidden">
          {/* Mobile header removed since PublicNavbar provides it */}
        </div>
        
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
}
