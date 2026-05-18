import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from '@/lib/env';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  // Refresh the session (important for token rotation)
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  async function getUserRole() {
    if (!user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role ?? null;
  }

  // Protect dashboard routes. Role enforcement happens in each dashboard page via requireRole().
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect root
  if (pathname === '/') {
    if (user) {
      const role = await getUserRole();
      return NextResponse.redirect(new URL(`/dashboard/${role || 'employee'}`, request.url));
    }
    // Guest users see the marketing landing page
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && user) {
    const role = await getUserRole();
    return NextResponse.redirect(new URL(`/dashboard/${role || 'employee'}`, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
};
