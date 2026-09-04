import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Runs on every request. Two jobs:
 *  1. Refresh the Supabase auth session cookie (standard @supabase/ssr setup).
 *  2. For /admin/*, do a cheap "is anyone even signed in" check and redirect
 *     to /login if not.
 *
 * IMPORTANT: this is a UX shortcut, not the real authorization boundary.
 * The actual admin check (role === 'admin', re-read from the database) is
 * done again in app/admin/layout.tsx via requireAdmin(), and again inside
 * every admin server action. Middleware can be bypassed by calling a server
 * action directly, so it must never be the only gate — knowing the /admin
 * URL is not enough here even for a signed-in customer.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
