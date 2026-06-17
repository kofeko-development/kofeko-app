'use client';

import React from 'react';
import { CheckCircle, Circle, Clock, FileCheck, Mic, Award, XCircle, Users } from 'lucide-react';
import { getActiveHiringStages } from '@/lib/hiring-stages';

const getStageIcon = (stageKey: string) => {
  switch (stageKey) {
    case 'applied': return FileCheck;
    case 'screening': return Clock;
    case 'technical_interview': return Mic;
    case 'hr_interview': return Users;
    case 'offer': return Award;
    case 'hired': return CheckCircle;
    default: return Circle;
  }
};

interface ApplicationTimelineProps {
  currentStage: string;
  customStages?: {
    stage: string;
    label: string;
    order: number;
    enabled: boolean;
  }[] | null;
}

export default function ApplicationTimeline({ currentStage, customStages }: ApplicationTimelineProps) {
  const stages = React.useMemo(() => getActiveHiringStages(customStages), [customStages]);

  const currentStageIndex = React.useMemo(() => {
    if (currentStage === 'rejected') return -1;
    const idx = stages.findIndex(s => s.stage === currentStage);
    return idx !== -1 ? idx : 0;
  }, [stages, currentStage]);

  if (currentStage === 'rejected') {
    return (
      <div className="flex items-center p-4 rounded-lg bg-destructive/10 border border-destructive/20 w-full">
        <XCircle className="h-8 w-8 text-destructive mr-4 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-destructive">Application Withdrawn or Rejected</h4>
          <p className="text-sm text-muted-foreground">This application is no longer under consideration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        {stages.map((stage, index) => {
          const isCompleted = currentStageIndex > index;
          const isCurrent = currentStageIndex === index;
          const isFuture = currentStageIndex < index;
          const Icon = getStageIcon(stage.stage);

          return (
            <React.Fragment key={stage.stage}>
              <div className="flex flex-col items-center text-center flex-1 px-1">
                <div
                  className={cn(
                    'h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-primary/20 border-primary text-primary animate-pulse',
                    isFuture && 'bg-muted border-slate-200 text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3">
                  <p
                    className={cn(
                      'text-xs font-semibold leading-tight line-clamp-2 max-w-[120px]',
                      isCompleted && 'text-primary',
                      isCurrent && 'text-primary font-bold',
                      isFuture && 'text-muted-foreground font-medium'
                    )}
                  >
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 capitalize mt-0.5">
                    {stage.stage.startsWith('custom_') ? 'Custom Round' : stage.stage.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    'hidden sm:block flex-1 h-[2px] rounded-full mt-6 self-start mx-2 transition-colors duration-500',
                    isCompleted ? 'bg-primary' : 'bg-slate-100'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
