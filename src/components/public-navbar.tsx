'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '/#features', sectionId: 'features' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();

  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/candidate-auth');
  const isFrosted = scrolled || isAuthPage;

  useEffect(() => {
    const updateNavigationState = () => {
      setScrolled(window.scrollY > 20);

      if (pathname !== '/') {
        setActiveSection(null);
        return;
      }

      const features = document.getElementById('features');
      if (!features) return;

      const { top, bottom } = features.getBoundingClientRect();
      setActiveSection(top <= 132 && bottom > 132 ? 'features' : null);
    };

    updateNavigationState();
    window.addEventListener('scroll', updateNavigationState, { passive: true });
    return () => window.removeEventListener('scroll', updateNavigationState);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const isLinkActive = (link: (typeof navLinks)[number]) => {
    if (link.sectionId) return pathname === '/' && activeSection === link.sectionId;
    return pathname === link.href;
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[60] rounded-control bg-primary px-4 py-3 font-semibold text-white focus:not-sr-only"
      >
        Skip to content
      </a>

      <nav
        aria-label="Primary navigation"
        className={cn(
          'fixed inset-x-0 top-0 z-50 px-6 transition-all duration-300',
          isFrosted && !isAuthPage
            ? 'border-b border-slate-200/50 py-4 shadow-sm bg-white/80 backdrop-blur-xl'
            : !isAuthPage ? 'bg-transparent py-6' : '',
          isAuthPage && 'bg-white py-4 border-b border-slate-200/50'
        )}
      >
        <div className="page-container flex items-center justify-between">
          <Link href="/" className="flex items-center rounded-control focus-visible:ring-offset-transparent">
            <Image
              src="/Kofeko.svg"
              alt="Kofeko"
              width={154}
              height={50}
              priority
              className="h-12 w-auto transition-all"
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-7">
              {navLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-control px-1 py-2 text-base font-semibold transition-colors',
                      active ? 'text-primary' : 'text-slate-600 hover:text-primary'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4 border-l pl-8 border-slate-200">
              <Link href="/company-login" className="rounded-control px-1 py-2 text-base font-semibold transition-colors text-slate-600 hover:text-primary">
                Log in
              </Link>
              <Button asChild className="rounded-full px-6 shadow-sm">
                <Link href="/company-signup">Register</Link>
              </Button>
            </div>
          </div>

          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-control text-slate-600 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileOpen && (
          <div id="mobile-navigation" className="absolute inset-x-0 top-full border-b bg-white p-6 shadow-2xl md:hidden">
            <div className="page-container flex flex-col space-y-3">
              {navLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-control px-3 py-3 text-lg font-medium transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-50'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-3 flex flex-col space-y-3 border-t border-slate-100 pt-6">
                <Button asChild variant="outline" className="h-12 w-full justify-center rounded-control text-base" onClick={() => setMobileOpen(false)}>
                  <Link href="/company-login">Log in</Link>
                </Button>
                <Button asChild className="h-12 w-full justify-center rounded-control text-base" onClick={() => setMobileOpen(false)}>
                  <Link href="/company-signup">Register</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
