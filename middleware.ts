// ===========================================
// middleware.ts  (place this in the PROJECT ROOT, not in src/)
// Protects dashboard routes — redirects to login if not authenticated
// ===========================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — important, do not remove
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup');
  const isDashboardPage =
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/upload') ||
    url.pathname.startsWith('/files');

  // If user is not logged in and tries to access a protected page → redirect to login
  if (!user && isDashboardPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and visits login/signup → redirect to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
