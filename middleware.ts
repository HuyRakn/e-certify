// middleware.ts
// All code and comments must be in English.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response object first to handle cookies properly
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client for middleware with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          // Set cookie in both request and response
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          // Remove cookie from both request and response
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

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

  // Now check session for protected routes
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // If no session and trying to access protected route, redirect to login
  if (!session || sessionError) {
    // Only redirect if not already on login page
    if (pathname !== '/login') {
      const loginRedirect = NextResponse.redirect(new URL('/login', request.url));
      // Copy cookies from current response to redirect response
      response.cookies.getAll().forEach((cookie) => {
        loginRedirect.cookies.set(cookie);
      });
      return loginRedirect;
    }
    return response;
  }

  // Get user role from JWT token (user_role claim added by Auth Hook)
  // Fallback to database query if JWT claim is not available
  let userRole = 'student';
  
  // Try to get role from JWT token first (faster, no DB query)
  if (session.user && (session.user as any).user_metadata?.user_role) {
    userRole = (session.user as any).user_metadata.user_role;
  } else if (session.user && (session.user as any).app_metadata?.user_role) {
    userRole = (session.user as any).app_metadata.user_role;
  } else {
    // Fallback: query database if JWT claim is not available
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        userRole = profile.role || 'student';
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    }
  }

  // --- Require verified email before accessing the app (except allowed paths) ---
  if (session && !sessionError) {
    const emailConfirmedAt = (session.user as any).email_confirmed_at || (session.user as any).confirmed_at;
    const isVerificationPage = pathname.startsWith('/verify-email');
    const isAuthOrPublic = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup');
    if (!emailConfirmedAt && !isVerificationPage && !isAuthOrPublic) {
      const verifyRedirect = NextResponse.redirect(new URL('/verify-email', request.url));
      response.cookies.getAll().forEach((cookie) => {
        verifyRedirect.cookies.set(cookie);
      });
      return verifyRedirect;
    }
  }

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

