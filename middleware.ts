import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Types for decoded JWT
interface DecodedToken {
  uid: string;
  email: string;
  role?: 'employee' | 'admin';
  custom_claims?: {
    role: 'employee' | 'admin';
  };
}

function resolveRole(token: DecodedToken) {
  return token.custom_claims?.role || token.role || 'employee';
}

// Protected routes configuration
const PROTECTED_ROUTES = {
  admin: ['/admin'],
  employee: ['/dashboard', '/activities', '/break', '/check-in', '/progress', '/education', '/challenges', '/feedback'],
  auth: ['/login'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get('role')?.value;

  // Allow public access to auth routes without token
  if (
    pathname.startsWith('/(auth)') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/admin/login')
  ) {
    const token = request.cookies.get('token')?.value;

    // If user already logged in, redirect to appropriate dashboard
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const role = roleCookie === 'admin' || roleCookie === 'employee'
          ? roleCookie
          : resolveRole(decoded);

        if (pathname.includes('/login')) {
          return NextResponse.redirect(
            new URL(role === 'admin' ? '/admin/dashboard' : '/dashboard', request.url)
          );
        }
      } catch (error) {
        // Invalid token, allow access to login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Allow unauthenticated access to employee pages for demo/preview
  const PREVIEW_ROUTES = ['/dashboard', '/activities', '/break', '/progress', '/education', '/challenges', '/feedback'];
  if (PREVIEW_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Check for token on protected routes
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL(pathname.startsWith('/admin') ? '/admin/login' : '/login', request.url)
    );
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const role = roleCookie === 'admin' || roleCookie === 'employee'
      ? roleCookie
      : resolveRole(decoded);

    // Role-based route protection
    if (pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } else if (PROTECTED_ROUTES.employee.some((route) => pathname.startsWith(route))) {
      if (role !== 'employee' && role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Continue to the requested route
    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
};
