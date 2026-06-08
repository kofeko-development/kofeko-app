'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { resetModalLock } from '@/lib/reset-modal-lock';

/** Prevent stuck Radix overlays / body pointer-events after client navigations. */
export function ModalRouteCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    resetModalLock();
    const timer = window.setTimeout(resetModalLock, 300);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
