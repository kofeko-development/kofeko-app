
'use client';

import React from 'react';
import { CheckCircle, Circle, Clock, FileCheck, Mic, Award, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const stages = [
  { id: 'submitted', label: 'Application Submitted', icon: FileCheck },
  { id: 'screening', label: 'Screening', icon: Clock },
  { id: 'interview', label: 'Interview', icon: Mic },
  { id: 'offer', label: 'Offer', icon: Award },
  { id: 'hired', label: 'Hired', icon: CheckCircle },
];

const getStatusIndex = (status: string) => {
  if (status === 'rejected') return -1;
  const index = stages.findIndex(s => s.id === status);
  return index;
};

interface ApplicationTimelineProps {
  currentStatus: 'submitted' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
}

export default function ApplicationTimeline({ currentStatus }: ApplicationTimelineProps) {
  const currentStatusIndex = getStatusIndex(currentStatus);

  if (currentStatus === 'rejected') {
    return (
      <div className="flex items-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <XCircle className="h-8 w-8 text-destructive mr-4" />
        <div>
          <h4 className="font-semibold text-destructive">Application Withdrawn or Rejected</h4>
          <p className="text-sm text-muted-foreground">This application is no longer under consideration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
        <div className="flex items-center">
        {stages.map((stage, index) => {
            const isCompleted = currentStatusIndex > index;
            const isCurrent = currentStatusIndex === index;
            const isFuture = currentStatusIndex < index;

            return (
            <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center text-center w-24">
                    <div
                        className={cn(
                        'h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0',
                        isCompleted && 'bg-primary border-primary text-primary-foreground',
                        isCurrent && 'bg-primary/20 border-primary text-primary animate-pulse',
                        isFuture && 'bg-muted border-gray-300 text-muted-foreground'
                        )}
                    >
                        <stage.icon className="h-6 w-6" />
                    </div>
                </div>
                {index < stages.length - 1 && (
                <div
                    className={cn(
                    'flex-1 h-1 rounded-full transition-colors duration-500 mx-2',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                />
                )}
            </React.Fragment>
            );
        })}
        </div>
        <div className="flex items-start mt-2">
            {stages.map((stage, index) => {
                const isCompleted = currentStatusIndex > index;
                const isCurrent = currentStatusIndex === index;
                const isFuture = currentStatusIndex < index;
                 return (
                    <React.Fragment key={stage.id}>
                         <div className="flex flex-col items-center text-center w-24">
                            <p
                                className={cn(
                                'text-xs font-semibold mt-2 transition-colors h-8',
                                isCompleted && 'text-primary',
                                isCurrent && 'text-primary',
                                isFuture && 'text-muted-foreground'
                                )}
                            >
                                {stage.label}
                            </p>
                        </div>
                        {index < stages.length - 1 && (
                             <div className="flex-1 mx-2" />
                        )}
                    </React.Fragment>
                 )
            })}
        </div>
    </div>
  );
}
