import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Brand assets (cropped to the artwork): full = icon + "Kofeko" wordmark, icon = mark only.
const LOGOS = {
  full: { src: '/brand/kofeko-logo.svg', ratio: 778 / 220, defaultHeight: 32 },
  icon: { src: '/brand/kofeko-icon.svg', ratio: 1, defaultHeight: 32 },
} as const;

interface LogoProps {
  /** `full` (icon + name) everywhere there is room; `icon` for tight spots like a collapsed sidebar. */
  variant?: keyof typeof LOGOS;
  /** Rendered height in px; width follows the logo's proportions. */
  height?: number;
  /** `white` for dark backgrounds. */
  tone?: 'brand' | 'white';
  href?: string;
  className?: string;
}

export function getAppHomeHref(role?: string): string {
  if (role === 'operator') return '/admin/dashboard';
  if (role === 'candidate') return '/find-jobs';
  return '/dashboard';
}

export default function Logo({ variant = 'full', height, tone = 'brand', href, className }: LogoProps) {
  const logo = LOGOS[variant];
  const h = height ?? logo.defaultHeight;
  const w = Math.round(h * logo.ratio);

  const image = (
    <Image
      src={logo.src}
      alt="Kofeko"
      width={w}
      height={h}
      priority
      style={{ height: h, width: w }}
      className={cn(tone === 'white' && 'brightness-0 invert', !href && className)}
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className={cn('inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)} aria-label="Go to home">
      {image}
    </Link>
  );
}
