// @ts-ignore
if (typeof self === 'undefined') { globalThis.self = globalThis; }
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Domain to organization mapping (Auxlo products)
const DOMAIN_ORG_MAP: Record<string, string> = {
  'auxlo.uk': 'auxlo',
  'www.auxlo.uk': 'auxlo',
  // Add per-product domains here as they go live (Pajo, etc.)
};

// Middleware for domain-based routing and protecting admin routes
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Get hostname from request headers
  const hostname = req.headers.get('host') || '';
  const orgSlug = DOMAIN_ORG_MAP[hostname.toLowerCase()];

  // Add pathname and organization to request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  if (orgSlug) {
    requestHeaders.set('x-organization-slug', orgSlug);
  }

  // NOTE: Domain-based rewrites were removed — this codebase is Auxlo-only now.
  // (/pajo, /admin etc. are served directly; add per-domain rewrites above if a
  // product ever needs its own domain routed to a route group.)

  // Get NextAuth token for admin route protection
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1. Handle onboarding redirect for new users
  // If user is logged in but has status 'new', redirect to /auth/onboard
  // (unless they are already going there or to the onboarding API).
  // Preserve where they were headed as `returnTo` so an invited member who
  // arrived via a pot join link (?token=...) doesn't lose that invitation
  // context — onboarding sends them back to this exact URL once they've
  // picked a role. Treasurers just ignore returnTo and go create a pot.
  //
  // CRITICAL: this must only ever apply to *page* navigations. Redirecting an
  // API request hands the onboarding HTML to a client expecting JSON, which
  // breaks NextAuth's own endpoints: GET/POST /api/auth/session (used by
  // useSession() and update()) comes back as HTML -> "Unexpected token '<'",
  // and POST /api/auth/_log lands on a page route -> 405. That previously left
  // freshly-signed-up users stuck on "Setting up your account…" forever,
  // because the session refresh after onboarding never completed.
  const isApiOrAsset =
    pathname.startsWith('/api/') || pathname.startsWith('/_next/');

  if (
    token &&
    (token as any).status === 'new' &&
    !isApiOrAsset &&
    !pathname.startsWith('/auth/onboard')
  ) {
    const originalDestination = pathname + url.search;
    url.pathname = '/auth/onboard';
    url.search = '';
    url.searchParams.set('returnTo', originalDestination);
    return NextResponse.redirect(url);
  }

  // 2. For all /admin, /gemroc, /pajo, and /api/agent routes, enforce next-auth token
  // (unless Pajo preview bypass is enabled — see PAJO_BYPASS_AUTH in .env)
  const pajoBypass = process.env.PAJO_BYPASS_AUTH === 'true';
  const isPajoJoin = pathname.startsWith('/pajo/') && pathname.endsWith('/join');
  
  const requiresAuth =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/gemroc') ||
    pathname.startsWith('/api/agent') ||
    (pathname.startsWith('/pajo') && !pajoBypass && !isPajoJoin);

  if (requiresAuth) {
    if (!token) {
      // No token - redirect to sign in
      url.pathname = '/api/auth/signin';
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    // For /gemroc, also check if the user is an admin
    if (pathname.startsWith('/gemroc') && !(token as any).isAdmin) {
      console.log(`[Middleware] Non-admin access attempt to ${pathname} by ${token.email}`);
      url.pathname = '/api/auth/signin'; // Redirect to sign-in or unauthorized
      return NextResponse.redirect(url);
    }

    // Token exists and authorized - allow through
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Define Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://accounts.google.com;
    connect-src 'self' https://apis.google.com https://storage.googleapis.com http://127.0.0.1:8001 http://localhost:8001 https://gemroc-api-mtsnmyodla-ew.a.run.app;
    upgrade-insecure-requests;
  `;

  // Replace newlines with spaces for header value
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  );

  // Fix Permissions-Policy warnings
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()'
  );

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and fonts
    '/((?!_next/static|_next/image|assets|favicon.ico|.*\\.woff2$).*)',
  ],
};