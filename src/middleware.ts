import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PREFIX_ROUTES = [
  '/dashboard',
  '/job-postings',
  '/team',
  '/company-profile',
  '/subscription',
  '/settings',
  '/applicants',
  '/jd-builder',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hint = request.cookies.get('kofeko_auth_hint')?.value;

  if (hint !== 'admin') {
    return NextResponse.next();
  }

  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  for (const route of ADMIN_PREFIX_ROUTES) {
    if (route === '/dashboard') continue;
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      if (pathname.startsWith('/admin')) return NextResponse.next();
      if (pathname.startsWith('/ai-evaluation-lab') || pathname.startsWith('/profile') || pathname.startsWith('/my-profile')) {
        return NextResponse.next();
      }
      // Integrations live at /admin/integrations, not /admin/settings/*
      if (pathname.startsWith('/settings/integrations')) {
        const url = new URL('/admin/integrations', request.url);
        url.search = request.nextUrl.search;
        return NextResponse.redirect(url);
      }
      return NextResponse.redirect(new URL(`/admin${pathname}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/job-postings/:path*',
    '/team/:path*',
    '/company-profile/:path*',
    '/subscription/:path*',
    '/settings/:path*',
    '/applicants/:path*',
    '/jd-builder/:path*',
  ],
};
