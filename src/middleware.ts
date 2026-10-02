import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PREFIX_ROUTES = [
  '/dashboard',
  '/job-postings',
  '/team',
  '/company-profile',
  '/subscription',
  '/settings',
  '/security',
  '/applicants',
  '/jd-builder',
];

// Super admin portal: served at superadmin.<domain>/<page>; the pages live under /superadmin/* in the app.
// Locally (no subdomain) it stays at /superadmin/*.
const SUPERADMIN_PAGES = ['/login', '/dashboard', '/settings', '/forgot-password', '/reset-password'];
const SUPERADMIN_URL = process.env.NEXT_PUBLIC_SUPERADMIN_URL?.replace(/\/$/, '');

function requestHost(request: NextRequest): string {
  const raw = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  return raw.split(',')[0].trim().toLowerCase();
}

// Build absolute URLs from the public host: on Amplify, request.url carries the internal host.
function publicUrl(request: NextRequest, host: string, pathname: string): URL {
  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0].trim() ??
    request.nextUrl.protocol.replace(':', '');
  const url = new URL(`${proto}://${host}${pathname}`);
  url.search = request.nextUrl.search;
  return url;
}

function superAdminHostResponse(request: NextRequest, host: string): NextResponse {
  const { pathname } = request.nextUrl;

  // Old /superadmin/* links (and in-app navigation) -> clean URL on this host
  if (pathname === '/superadmin' || pathname.startsWith('/superadmin/')) {
    return NextResponse.redirect(publicUrl(request, host, pathname.slice('/superadmin'.length) || '/'));
  }

  const page = pathname === '/' ? '/login' : pathname;
  if (SUPERADMIN_PAGES.includes(page)) {
    const url = request.nextUrl.clone();
    url.pathname = `/superadmin${page}`;
    return NextResponse.rewrite(url);
  }

  // Nothing else from the main site is served on the super admin host
  return NextResponse.redirect(publicUrl(request, host, '/'));
}

function companyAdminResponse(request: NextRequest): NextResponse {
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = requestHost(request);

  if (host.startsWith('superadmin.')) {
    return superAdminHostResponse(request, host);
  }

  // Main site: the super admin portal moved to its own subdomain (when configured)
  if (SUPERADMIN_URL && (pathname === '/superadmin' || pathname.startsWith('/superadmin/'))) {
    const url = new URL(`${SUPERADMIN_URL}${pathname.slice('/superadmin'.length) || '/'}`);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  return companyAdminResponse(request);
}

export const config = {
  // Every page request (the super admin host needs all paths); skip build assets and static files
  matcher: ['/((?!_next/|favicon.ico|.*\\..*).*)'],
};
