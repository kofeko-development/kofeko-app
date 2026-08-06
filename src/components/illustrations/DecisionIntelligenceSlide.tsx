import { CheckCircle2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

const candidates = [
  { name: 'Sarah Chen', score: '92%', status: 'Strong fit' },
  { name: 'Rahul Patel', score: '86%', status: 'Worth discussing' },
  { name: 'Emma Wilson', score: '81%', status: 'Potential' },
];

export default function DecisionIntelligenceSlide() {
  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <div className="grid w-full grid-cols-[230px_1fr] items-stretch gap-5">
        <div className="rounded-panel border border-slate-200 bg-white/80 p-4 shadow-card backdrop-blur-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <UsersRound className="size-4 text-primary" />
            Decision workspace
          </div>
          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <div key={candidate.name} className={`rounded-card border p-3 ${index === 0 ? 'border-primary/30 bg-primary/5' : 'border-slate-100 bg-white'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{candidate.name}</span>
                  <span className="text-sm font-bold text-primary">{candidate.score}</span>
                </div>
                <span className="mt-1 block text-xs text-slate-500">{candidate.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-panel border border-slate-200 bg-white/80 p-5 shadow-feature backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Decision brief</p>
              <p className="mt-1 text-xs text-slate-500">Complete context before a final call</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-card bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
          </div>

          <div className="mt-5 rounded-card border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary"><CheckCircle2 className="size-4" /> Ready to decide</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">Sarah leads on role alignment, relevant experience, and interviewer confidence.</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {['Role fit', 'Evidence', 'Team feedback'].map((label, index) => (
              <div key={label} className="rounded-control bg-slate-50 p-3 text-center">
                <p className="text-base font-bold text-slate-900">{[92, 88, 90][index]}%</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <ShieldCheck className="size-4 shrink-0 text-stage-moving" />
            Explainable recommendation with the evidence behind it.
          </div>
        </div>
      </div>
    </div>
  );
}
