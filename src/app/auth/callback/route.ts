// ===========================================
// src/app/auth/callback/route.ts
// Supabase redirects here after email confirmation
// This exchanges the code for a session and sends user to dashboard
// ===========================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, send to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=Could not confirm your email. Try again.`);
}
