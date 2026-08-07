import Link from 'next/link';

import { cn } from '@/lib/utils';

type AuthPortalSwitcherProps = {
  active: 'company' | 'candidate';
  className?: string;
};

export function AuthPortalSwitcher({ active, className }: AuthPortalSwitcherProps) {
  const isCompany = active === 'company';

  return (
    <div
      className={cn(
        'mb-8 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4',
        className,
      )}
    >
      <span className="text-sm text-slate-600">
        {isCompany ? 'Are you a candidate?' : 'Are you a company?'}
      </span>
      <Link
        href={isCompany ? '/candidate-auth?mode=login' : '/company-login'}
        prefetch
        className="text-sm font-bold text-primary transition-colors hover:text-primary/80"
      >
        {isCompany ? 'Candidate Login →' : '← Company Login'}
      </Link>
    </div>
  );
}
