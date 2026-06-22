import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

type CookieOptions = {
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
  httpOnly?: boolean;
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Avoid redirect loops by:
  // - never middleware-redirecting API routes / static assets
  // - never forcing redirects when we're already on the destination route
  // - skipping auth callback route that performs session exchange
  if (
    pathname === '/auth/callback' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/')
  ) {
    return response;
  }

  const isAuthRoute =
    pathname.startsWith('/auth') ||
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/reset-password' ||
    pathname === '/accept-invite';

  const protectedRoutes = [
    '/dashboard',
    '/students',
    '/applications',
    '/tasks',
    '/inbox',
    '/notifications',
    '/settings',
    '/audit-logs',
    '/manual'
  ];
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (isProtectedRoute) {
    if (!data.user) {
      if (pathname !== '/signin') {
        return NextResponse.redirect(new URL('/signin', request.url));
      }
    } else {
      const { data: membership } = await supabase
        .from('memberships')
        .select('tenant_id')
        .eq('user_id', data.user.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        const redirectResponse = NextResponse.redirect(new URL('/signin', request.url));
        const redirectSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get(name: string) {
                return request.cookies.get(name)?.value;
              },
              set(name: string, value: string, options: CookieOptions) {
                redirectResponse.cookies.set({ name, value, ...options });
              },
              remove(name: string, options: CookieOptions) {
                redirectResponse.cookies.set({ name, value: '', ...options, maxAge: 0 });
              },
            },
          }
        );
        await redirectSupabase.auth.signOut();
        return redirectResponse;
      }
    }
  }

  if (isAuthRoute && data.user && (pathname === '/signin' || pathname === '/signup')) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('tenant_id')
      .eq('user_id', data.user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();

    if (membership) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      const redirectResponse = NextResponse.next({ request });
      const redirectSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              redirectResponse.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              redirectResponse.cookies.set({ name, value: '', ...options, maxAge: 0 });
            },
          },
        }
      );
      await redirectSupabase.auth.signOut();
      return redirectResponse;
    }
  }

  return response;

}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
