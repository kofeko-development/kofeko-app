import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Layers, UserCheck, BrainCircuit, CheckCircle2,
  Zap, Sliders, LineChart, ShieldCheck
} from 'lucide-react';

type Capability = {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  features: Array<{ title: string; desc: string }>;
};

type ColorTheme = {
  text: string;
  bg: string;
  borderHover: string;
  iconBg: string;
  bullet: string;
};

type Stage = {
  title: string;
  colorTheme: ColorTheme;
  cards: Capability[];
};

const STAGES: Stage[] = [
  {
    title: 'BEFORE HIRING',
    colorTheme: {
      text: 'text-stage-before',
      bg: 'bg-stage-before-surface',
      borderHover: 'hover:border-stage-before/40',
      iconBg: 'bg-stage-before/10',
      bullet: 'bg-stage-before'
    },
    cards: [
      {
        id: 'build-better',
        title: 'Build Better Foundations',
        desc: 'Lay the right foundation before the first application arrives.',
        icon: Layers,
        features: [
          { title: 'AI Role Blueprint', desc: 'Converts free-text job requirements into a structured hiring blueprint with AI.' },
          { title: 'Weighted Skill Framework', desc: 'Assign importance to every skill so candidates are evaluated against what matters most.' },
          { title: 'Structured Hiring Criteria', desc: 'Define clear success criteria before candidate evaluation begins.' },
          { title: 'Hiring Market Validation', desc: 'Validate role expectations against real-world talent availability.' },
          { title: 'Change Impact Alerts', desc: 'See how changing role requirements impacts sourcing, timelines and hiring progress.' }
        ]
      },
      {
        id: 'find-fit',
        title: 'Find The Right Fit',
        desc: 'Identify the right candidates before the interviews begin.',
        icon: UserCheck,
        features: [
          { title: 'AI Candidate Scoring', desc: 'Score every candidate using skills, experience and context—not just keywords and job titles.' },
          { title: 'Explainable Match Scores', desc: 'Understand the reasoning behind every candidate\'s match score.' },
          { title: 'Candidate Signal Summary', desc: 'Review the strengths, gaps and hiring signals behind every recommendation in one view.' },
          { title: 'Balanced Shortlists', desc: 'Create stronger, more balanced shortlists with AI-assisted candidate evaluation.' },
          { title: 'Live Candidate Ranking', desc: 'Keep candidate rankings up to date as new applications and hiring signals are added.' }
        ]
      }
    ]
  },
  {
    title: 'DURING EVALUATION',
    colorTheme: {
      text: 'text-stage-evaluation',
      bg: 'bg-stage-evaluation-surface',
      borderHover: 'hover:border-stage-evaluation/40',
      iconBg: 'bg-stage-evaluation/10',
      bullet: 'bg-stage-evaluation'
    },
    cards: [
      {
        id: 'evaluate-ai',
        title: 'Evaluate With AI',
        desc: 'Evaluate every candidate with structured, AI-powered assessments and interviews.',
        icon: BrainCircuit,
        features: [
          { title: 'AI Assessments', desc: 'Assess technical skills, critical thinking and role-specific competencies with AI.' },
          { title: 'AI Interview Questions', desc: 'Generate tailored interview questions based on the role and each candidate\'s profile.' },
          { title: 'Interview Intelligence', desc: 'Record, transcribe and analyze interviews to uncover strengths, risks and key hiring signals.' },
          { title: 'AI Feedback Analysis', desc: 'Combine interview notes, assessments and stakeholder feedback into one structured hiring recommendation.' }
        ]
      },
      {
        id: 'decide-confidence',
        title: 'Decide With Confidence',
        desc: 'Make confident hiring decisions faster with complete context.',
        icon: CheckCircle2,
        features: [
          { title: 'Candidate Comparison', desc: 'Compare candidates side-by-side across every decision that matters.' },
          { title: 'Decision Support', desc: 'Know when you have enough information to make a confident hiring decision.' },
          { title: 'Risk Insights', desc: 'Understand hiring risks before making your final decision.' },
          { title: 'AI Hiring Recommendations', desc: 'Review balanced recommendations backed by explainable hiring signals.' },
          { title: 'Decision Summaries', desc: 'Bring every hiring signal together into one clear recommendation.' }
        ]
      }
    ]
  },
  {
    title: 'KEEP HIRING MOVING',
    colorTheme: {
      text: 'text-stage-moving',
      bg: 'bg-stage-moving-surface',
      borderHover: 'hover:border-stage-moving/40',
      iconBg: 'bg-stage-moving/10',
      bullet: 'bg-stage-moving'
    },
    cards: [
      {
        id: 'eliminate-manual',
        title: 'Eliminate Manual Work',
        desc: 'Spend less time on repetitive tasks and more time hiring the right people.',
        icon: Zap,
        features: [
          { title: 'Candidate Updates', desc: 'Keep candidates informed automatically throughout every stage of hiring.' },
          { title: 'Smart Follow-ups', desc: 'Automatically remind recruiters and hiring managers when actions are overdue.' },
          { title: 'Feedback Collection', desc: 'Collect interview feedback from every stakeholder in one place.' },
          { title: 'Parallel Hiring Workflows', desc: 'Run hiring activities simultaneously instead of waiting for one task to finish before another begins.' },
          { title: 'Drop-off Prevention', desc: 'Identify disengaged candidates early and keep hiring momentum strong.' }
        ]
      },
      {
        id: 'stay-control',
        title: 'Stay In Control',
        desc: 'See where every role stands, identify bottlenecks early and keep hiring on track.',
        icon: Sliders,
        features: [
          { title: 'Hiring Dashboard', desc: 'Track every open role from application to final decision.' },
          { title: 'Team Accountability', desc: 'Understand who owns each hiring stage and what\'s waiting for action.' },
          { title: 'Bottleneck Detection', desc: 'Identify delays impacting your hiring timeline.' },
          { title: 'Hiring Analytics', desc: 'Measure hiring performance with actionable insights and trends.' },
          { title: 'Smart Escalations', desc: 'Automatically surface stalled hiring processes before momentum is lost.' }
        ]
      }
    ]
  },
  {
    title: 'PLATFORM INTELLIGENCE',
    colorTheme: {
      text: 'text-stage-intelligence',
      bg: 'bg-stage-intelligence-surface',
      borderHover: 'hover:border-stage-intelligence/40',
      iconBg: 'bg-stage-intelligence/10',
      bullet: 'bg-stage-intelligence'
    },
    cards: [
      {
        id: 'platform-learns',
        title: 'Platform That Learns',
        desc: 'Continuously improve hiring decisions by learning what success looks like for your organization.',
        icon: LineChart,
        features: [
          { title: 'Organization Learning', desc: 'Learn from hiring outcomes unique to your organization.' },
          { title: 'Role Optimization', desc: 'Refine hiring criteria based on real-world hiring success.' },
          { title: 'Hiring Memory', desc: 'Build institutional hiring knowledge that stays with your team.' },
          { title: 'Continuous Improvement', desc: 'Reduce over-screening and improve recommendations over time.' },
          { title: 'Predictive Success Signals', desc: 'Identify the signals that consistently lead to better hiring outcomes.' }
        ]
      },
      {
        id: 'hire-transparently',
        title: 'Hire Transparently',
        desc: 'Build a hiring process that\'s fair, explainable and ready for evolving AI regulations.',
        icon: ShieldCheck,
        features: [
          { title: 'Explainable Why Cards', desc: 'Understand the reasoning behind every hiring recommendation.' },
          { title: 'Bias Monitoring', desc: 'Identify potential bias before it influences hiring decisions.' },
          { title: 'Audit-ready Reports', desc: 'Maintain a complete record of every hiring decision and recommendation.' },
          { title: 'Compliance Tools', desc: 'Stay aligned with evolving AI and hiring regulations.' }
        ]
      }
    ]
  }
];

export default function FeatureCapabilities() {
  return (
    <section id="features" className="section relative overflow-hidden bg-white">
      <div className="page-container">

        {/* Section Header */}
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <span className="text-primary font-bold tracking-wider text-sm uppercase mb-4 block">
            Everything Kofeko is built to do
          </span>
          <h2 className="text-4xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
            One platform. Every step of hiring. <br className="hidden md:block" /> All in one place.
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            From defining the right role to learning from every decision, Kofeko brings clarity, intelligence and speed to your entire hiring journey.
          </p>
        </div>

        {/* Desktop Layout: Grouped by Rows (2 Stages per row) */}
        <div className="hidden lg:flex flex-col gap-16">

          {/* Row 1 (Stages 1 & 2) */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              {STAGES.slice(0, 2).map((stage, sIdx) => (
                <div key={sIdx} className="text-center flex flex-col items-center">
                  <div className={`text-sm font-bold tracking-wider uppercase ${stage.colorTheme.text}`}>{stage.title}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-8">
              {STAGES.slice(0, 2).map((stage) => (
                stage.cards.map((card) => (
                  <CardComponent key={card.id} card={card} colorTheme={stage.colorTheme} />
                ))
              ))}
            </div>
          </div>

          {/* Row 2 (Stages 3 & 4) */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              {STAGES.slice(2, 4).map((stage, sIdx) => (
                <div key={sIdx} className="text-center flex flex-col items-center">
                  <div className={`text-sm font-bold tracking-wider uppercase ${stage.colorTheme.text}`}>{stage.title}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-8">
              {STAGES.slice(2, 4).map((stage) => (
                stage.cards.map((card) => (
                  <CardComponent key={card.id} card={card} colorTheme={stage.colorTheme} />
                ))
              ))}
            </div>
          </div>

        </div>

        {/* Mobile/Tablet Layout (Vertical stacking of stages) */}
        <div className="lg:hidden flex flex-col gap-16">
          {STAGES.map((stage, sIdx) => (
            <div key={sIdx} className="space-y-6">
              <div className="text-center flex flex-col items-center">
                <div className={`text-sm font-bold tracking-wider uppercase ${stage.colorTheme.text}`}>{stage.title}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {stage.cards.map((card) => (
                  <CardComponent key={card.id} card={card} colorTheme={stage.colorTheme} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Panels */}


      </div>
    </section>
  );
}

// Helper component to render individual capability cards
function CardComponent({ card, colorTheme }: { card: Capability; colorTheme: ColorTheme }) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-card border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-feature ${colorTheme.borderHover}`}
    >
      {/* Top Section with Background */}
      <div className={`p-8 pb-6 transition-colors duration-300 ${colorTheme.bg}`}>
        <div className={`size-14 rounded-2xl ${colorTheme.iconBg} ${colorTheme.text} flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110 duration-300`}>
          <card.icon className="size-7" />
        </div>

        <h3 className="mb-3 whitespace-nowrap text-[15px] font-bold leading-tight tracking-tight text-slate-900 xl:text-base">{card.title}</h3>
        <p className="min-h-[60px] text-sm leading-relaxed text-slate-600">
          {card.desc}
        </p>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-slate-100" />

      {/* Bottom Section */}
      <div className="p-8 pt-6 flex flex-col h-full relative z-10 bg-white">
        <ul className="space-y-5 flex-1">
          {card.features.map((feature) => (
            <li key={feature.title} className="flex gap-3 items-start">
              <div className={`mt-1.5 size-1.5 shrink-0 rounded-full ${colorTheme.bullet}`} />
              <div>
                <div className="text-sm font-bold text-slate-900 mb-1">{feature.title}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{feature.desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
