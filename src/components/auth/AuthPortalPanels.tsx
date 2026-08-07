import { BrainCircuit, LineChart, Sparkles, Map, Target, Zap } from 'lucide-react';

import AuthLegalTags from '@/components/auth-legal-tags';
import { cn } from '@/lib/utils';

type PanelProps = {
  className?: string;
};

export function CompanyAuthPanel({ className }: PanelProps) {
  return (
    <div className={cn('relative flex flex-col justify-center overflow-hidden p-12 lg:p-16 pt-24', className)}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-slate-900 to-slate-900 opacity-60" />
        <div className="absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto my-auto w-full max-w-md">
        <h1 className="mb-8 text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
          The intelligent <br />
          <span className="font-light text-primary-foreground/90">Hiring OS.</span>
        </h1>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <BrainCircuit className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Candidate Intelligence</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Go beyond keywords with semantic ranking and conversational screening.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <LineChart className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Hiring Analytics</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Real-time pipeline insights and automated reports for every stakeholder.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Zap className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Platform Intelligence</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Automate the busywork. Focus on the human connections that matter.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthLegalTags />
    </div>
  );
}

export function CandidateAuthPanel({ className }: PanelProps) {
  return (
    <div className={cn('relative flex flex-col justify-center overflow-hidden p-12 lg:p-16 pt-24', className)}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/40 via-slate-900 to-slate-900 opacity-60" />
        <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto my-auto w-full max-w-md">
        <h1 className="mb-8 text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
          Your career, <br />
          <span className="font-light text-primary-foreground/90">amplified by AI.</span>
        </h1>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Target className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Discover Opportunities</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Match with roles based on your true skills and potential, not just your past job titles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Map className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Track Applications</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                No more black holes. Get clear updates and AI-driven feedback at every stage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">One Global Profile</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Maintain one unified profile to effortlessly apply across thousands of partner companies.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthLegalTags />
    </div>
  );
}
