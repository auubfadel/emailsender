import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set([
  '/login',
  '/register',
  '/forgot',
  '/reset'
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = Array.from(PUBLIC_PATHS).some((p) => pathname.startsWith(p));

  const hasSession = req.cookies.get('authjs.session-token') || req.cookies.get('__Secure-authjs.session-token');

  if (!isPublic && !hasSession) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)']
};

