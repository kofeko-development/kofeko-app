import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'express';
  width?: number;
  height?: number;
  href?: string;
  className?: string;
}

export function getAppHomeHref(role?: string): string {
  if (role === 'operator') return '/admin/dashboard';
  if (role === 'candidate') return '/find-jobs';
  return '/dashboard';
}

export default function Logo({ variant = 'default', width, height, href, className }: LogoProps) {
  const logoPath = '/Kofeko.svg';

  const image =
    variant === 'express' ? (
      <Image
        src={logoPath}
        alt="Kofeko Express Logo"
        width={width || 150}
        height={height || 30}
        priority
        className={cn(!href && className)}
      />
    ) : (
      <Image
        src={logoPath}
        alt="Kofeko Logo"
        width={width || 120}
        height={height || 40}
        priority
        className={cn(!href && className)}
      />
    );

  if (!href) return image;

  return (
    <Link href={href} className={cn('inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)} aria-label="Go to home">
      {image}
    </Link>
  );
}
