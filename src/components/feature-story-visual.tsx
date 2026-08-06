import { CheckCircle2, ClipboardCheck, MessageSquareText, SearchCheck, Sparkles, UsersRound } from 'lucide-react';

type FeatureStoryVisualProps = {
  variant: 'role' | 'signals' | 'momentum';
};

const visualContent = {
  role: {
    label: 'Role blueprint',
    title: 'Senior backend engineer',
    icon: ClipboardCheck,
    accent: 'bg-stage-before-surface text-stage-before',
    items: ['Role outcomes defined', 'Skills weighted', 'Interview plan aligned'],
  },
  signals: {
    label: 'Candidate signals',
    title: 'Shortlist with context',
    icon: SearchCheck,
    accent: 'bg-stage-intelligence-surface text-stage-intelligence',
    items: ['Skill depth: strong', 'Relevant SaaS experience', 'Leadership evidence'],
  },
  momentum: {
    label: 'Hiring momentum',
    title: 'Feedback is moving',
    icon: MessageSquareText,
    accent: 'bg-stage-moving-surface text-stage-moving',
    items: ['Feedback collected', 'Bottleneck surfaced', 'Decision brief ready'],
  },
} as const;

export default function FeatureStoryVisual({ variant }: FeatureStoryVisualProps) {
  const content = visualContent[variant];
  const Icon = content.icon;

  return (
    <div className="relative overflow-hidden rounded-panel border border-slate-200 bg-white p-5 shadow-card sm:p-7">
      <div className="absolute -right-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-11 items-center justify-center rounded-card ${content.accent}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{content.label}</p>
              <p className="mt-1 font-bold text-slate-900">{content.title}</p>
            </div>
          </div>
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
        </div>

        <div className="rounded-card border border-slate-100 bg-slate-50 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Kofeko intelligence</span>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-primary shadow-soft">Updated now</span>
          </div>
          <div className="space-y-3">
            {content.items.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-control bg-white p-3 shadow-soft">
                <CheckCircle2 className="size-4 shrink-0 text-stage-moving" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {['Clarity', 'Signals', 'Action'].map((label, index) => (
            <div key={label} className="rounded-control border border-slate-100 bg-white p-3 text-center">
              <UsersRound className={`mx-auto size-4 ${index === 1 ? 'text-primary' : 'text-slate-400'}`} aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
