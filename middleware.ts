// middleware.ts
// All code and comments must be in English.
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response object first to handle cookies properly
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Allow access to auth callback routes FIRST (these handle session exchange)
  // This must be checked before session check to avoid redirect loops
  if (
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/auth/callback') ||
    pathname.startsWith('/auth/')
  ) {
    return response;
  }

  // Allow access to public/auth pages without session check
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth/')
  ) {
    return response;
  }

  // Allow any request that carries an OAuth "code" param to pass through
  // (Supabase/Providers may redirect back to arbitrary app paths with ?code=)
  if (request.nextUrl.searchParams.has('code')) {
    return response;
  }

  // NOTE: Supabase client usage is disabled here to keep middleware Edge-compatible.
  // Auth gating happens in server components/routes instead.
  let userRole = 'student';

  // --- Admin Route Protection ---
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      console.warn(`Non-admin user (${userRole}) denied access to: ${pathname}`);
      const dashboardRedirect = NextResponse.redirect(new URL('/dashboard', request.url));
      // Copy cookies from current response to redirect response
      response.cookies.getAll().forEach((cookie) => {
        dashboardRedirect.cookies.set(cookie);
      });
      return dashboardRedirect;
    }
  }

  // --- Teacher Route Protection ---
  if (pathname.startsWith('/teacher') || pathname.startsWith('/create-course')) {
    if (userRole !== 'teacher' && userRole !== 'admin') {
      console.warn(`Non-teacher user (${userRole}) denied access to: ${pathname}`);
      const dashboardRedirect = NextResponse.redirect(new URL('/dashboard', request.url));
      // Copy cookies from current response to redirect response
      response.cookies.getAll().forEach((cookie) => {
        dashboardRedirect.cookies.set(cookie);
      });
      return dashboardRedirect;
    }
  }
  
  // Return the response (cookies are already set in the response object)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};

