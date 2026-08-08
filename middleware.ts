import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

// Default redirect per role after login
export const ROLE_HOME: Record<string, string> = {
  STUDENT: '/student/dashboard',
  RECRUITER: '/recruiter/dashboard',
  ADMIN: '/admin/dashboard',
};

// Role → allowed path prefixes
const ROLE_ROUTES: Record<string, string[]> = {
  STUDENT: ['/student'],
  RECRUITER: ['/recruiter'],
  ADMIN: ['/admin'],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicPage = pathname === '/' || pathname.startsWith('/api');

  // If already logged in, redirect away from auth pages
  if (session && isAuthPage) {
    const home = ROLE_HOME[session.user.role] ?? '/';
    return NextResponse.redirect(new URL(home, req.url));
  }

  // Public pages and API routes don't need UI-level route rewrites
  if (isPublicPage || isAuthPage) return NextResponse.next();

  // Not authenticated → send to login
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const role = session.user.role;
  const allowedPrefixes = ROLE_ROUTES[role] ?? [];
  const allowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!allowed) {
    const home = ROLE_HOME[role] ?? '/';
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

