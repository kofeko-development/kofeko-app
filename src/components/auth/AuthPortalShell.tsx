'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';
import Logo from '@/components/logo';

import { CandidateAuthPanel, CompanyAuthPanel } from './AuthPortalPanels';

type TransitionDirection = 'initial' | 'to-candidate' | 'to-company';

export function AuthPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCandidate = pathname.startsWith('/candidate-auth');
  const previousIsCandidate = useRef<boolean | null>(null);
  const directionRef = useRef<TransitionDirection>('initial');

  if (previousIsCandidate.current === null) {
    directionRef.current = 'initial';
  } else if (previousIsCandidate.current !== isCandidate) {
    directionRef.current = isCandidate ? 'to-candidate' : 'to-company';
  }

  useEffect(() => {
    previousIsCandidate.current = isCandidate;
  }, [isCandidate]);

  const direction = directionRef.current;

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <div className="relative min-h-screen flex-1">
        <main
          id="main-content"
          className={cn(
            'relative z-20 flex min-h-screen items-start justify-center overflow-y-auto bg-white px-8 pb-12 pt-10 md:absolute md:inset-y-0 md:w-full md:px-8 md:py-12 lg:w-7/12 lg:px-24 lg:py-16',
            'transition-[left] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
            isCandidate ? 'md:left-[41.666667%]' : 'md:left-0',
          )}
        >
          <div className="absolute top-8 left-8 z-50">
            <Logo href="/" />
          </div>

          <div
            key={isCandidate ? 'candidate-form' : 'company-form'}
            className={cn(
              'mx-auto w-full max-w-md animate-in fade-in fill-mode-both duration-500',
              direction === 'to-candidate' && 'slide-in-from-right-4',
              direction === 'to-company' && 'slide-in-from-left-4',
              direction === 'initial' && 'slide-in-from-bottom-2 duration-700',
            )}
          >
            {children}
          </div>
        </main>

        <div
          className={cn(
            'absolute inset-y-0 z-10 hidden w-full overflow-hidden bg-slate-900 text-white transition-[left] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] md:block lg:w-5/12',
            isCandidate ? 'left-0' : 'left-[58.333333%]',
          )}
        >
          <CompanyAuthPanel
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              isCandidate ? 'pointer-events-none opacity-0' : 'opacity-100',
            )}
          />
          <CandidateAuthPanel
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              isCandidate ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          />
        </div>
      </div>
    </div>
  );
}
