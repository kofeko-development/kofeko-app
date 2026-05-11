
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import Logo from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

function staffDashboardHref(role: string | undefined) {
  return role === 'operator' ? '/admin/dashboard' : '/dashboard';
}

const publicNavLinks = [
    { href: '/#home', label: 'Home' },
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/about', label: 'About' },
];

export default function PublicNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check on initial render
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            (isScrolled || user) ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-transparent"
        )}>
            <div className="container">
                <div className="flex h-20 items-center">
                    <Link href="/">
                         <Logo />
                    </Link>

                    <div className="hidden md:flex items-center gap-2 ml-auto">
                        <nav className="flex items-center gap-1">
                             {publicNavLinks.map((link) => (
                                <Button key={link.href} variant="ghost" asChild>
                                    <Link
                                        href={link.href}
                                        className={cn(
                                            "text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg", 
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                        <div className="flex items-center pl-2">
                          {!loading && user ? (
                            <Button asChild className="btn-glass shadow-md text-sm font-semibold">
                              <Link href={staffDashboardHref(user.role)}>Dashboard</Link>
                            </Button>
                          ) : null}
                          {!loading && !user ? (
                            <Button asChild className="btn-glass shadow-md text-sm font-semibold">
                              <Link href="/register">Register</Link>
                            </Button>
                          ) : null}
                        </div>
                    </div>

                    <div className="md:hidden ml-auto">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-foreground hover:text-primary focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white/95 border-t border-gray-200/50 backdrop-blur-sm">
                    <nav className="flex flex-col items-center gap-2 p-4">
                        {publicNavLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-base font-medium text-foreground hover:text-primary transition-colors block w-full text-center py-2"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-4 w-full flex flex-col gap-2">
                            {!loading && user ? (
                                <Button asChild className="w-full btn-glass shadow-md">
                                    <Link href={staffDashboardHref(user.role)}><LayoutDashboard className="mr-2"/> Go to Dashboard</Link>
                                </Button>
                            ) : null}
                            {!loading && !user ? (
                                <Button asChild className="w-full btn-glass shadow-md">
                                    <Link href="/register">Register</Link>
                                </Button>
                            ) : null}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
