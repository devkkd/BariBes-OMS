import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

export async function middleware(request) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Public routes - Home page (/) and /login
  if (pathname === '/' || pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token.value, JWT_SECRET);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const { payload } = await jwtVerify(token.value, JWT_SECRET);
      
      // Role-based access control
      if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/']
};
