import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/pulse(.*)',
  '/stocks(.*)',
  '/alerts(.*)',
  '/profile(.*)',
  '/watchlist(.*)',
  '/discovery(.*)',
  '/search(.*)',
]);

const isAuthRoute = createRouteMatcher(['/login(.*)', '/signup(.*)', '/sso-callback(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect authenticated users away from login/signup
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL('/pulse', req.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
