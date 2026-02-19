import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decryptSession } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublic = [
        '/login',
        '/register',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/verify-email',
        '/forgot-password',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/reset-password',
        '/_next',
        '/static',
        '/',
        '/about',
        '/research'
    ].some(p => path === p || path.startsWith(p + '/'));

    const sessionCookie = request.cookies.get('session')?.value;
    const session = sessionCookie ? await decryptSession(sessionCookie) : null;

    if (!isPublic && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session) {
        // Role-based Redirects / Protection
        if (path.startsWith('/admin') && session.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (path.startsWith('/doctor') && session.role !== 'DOCTOR') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (path.startsWith('/therapist') && session.role !== 'THERAPIST') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
