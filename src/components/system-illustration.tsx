'use client';

import { useEffect, useState } from 'react';

import CandidateSignalsSlide from '@/components/illustrations/CandidateSignalsSlide';
import DecisionIntelligenceSlide from '@/components/illustrations/DecisionIntelligenceSlide';
import HiringFeedbackSlide from '@/components/illustrations/HiringFeedbackSlide';
import RoleClaritySlide from '@/components/illustrations/RoleClaritySlide';

const slides = [
  { id: 'role-clarity', title: 'Role Clarity', component: <RoleClaritySlide /> },
  { id: 'candidate-signals', title: 'Candidate Signals', component: <CandidateSignalsSlide /> },
  { id: 'hiring-feedback', title: 'Hiring Feedback', component: <HiringFeedbackSlide /> },
  { id: 'decision-intelligence', title: 'Decision Intelligence', component: <DecisionIntelligenceSlide /> },
];

export default function SystemIllustration() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(media.matches);

    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveSlide((previous) => (previous + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const active = slides[activeSlide];

  return (
    <section aria-label="Kofeko product demonstration" className="w-full">
      <div className="relative h-[250px] overflow-hidden sm:h-[330px] lg:h-[420px]">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[600px] -translate-x-1/2 -translate-y-1/2 origin-center scale-[0.4] sm:scale-[0.62] lg:scale-[0.76] xl:scale-[0.84] 2xl:scale-[0.92]">
          <div key={active.id} className={reduceMotion ? 'absolute inset-0' : 'absolute inset-0 animate-fadeIn'}>
            {active.component}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1" role="group" aria-label="Product demonstration slides">
        {slides.map((slide, index) => {
          const selected = activeSlide === index;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlide(index)}
              className="flex size-11 items-center justify-center rounded-full"
              aria-label={`Show ${slide.title} example`}
              aria-pressed={selected}
            >
              <span className={`h-2.5 rounded-full transition-all duration-300 ${selected ? 'w-8 bg-primary' : 'w-2.5 bg-slate-300'}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
