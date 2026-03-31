import Image from 'next/image';
import type { SVGProps } from 'react';

interface LogoProps {
  variant?: 'default' | 'express';
  width?: number;
  height?: number;
}

export default function Logo({ variant = 'default', width, height }: LogoProps) {
  const logoPath = '/Kofeko.svg';
  const expressLogoPath = '/Kofeko.svg';

  if (variant === 'express') {
    return (
      <Image
        src={expressLogoPath}
        alt="Kofeko Express Logo"
        width={width || 150}
        height={height || 30}
        priority // Preload the logo as it's likely important
      />
    );
  }

  return (
    <Image
      src={logoPath}
      alt="Kofeko Logo"
      width={width || 120}
      height={height || 40}
      priority
    />
  );
}
