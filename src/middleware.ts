import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: any) {
                    cookiesToSet.forEach(({ name, value, options }: any) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: DO NOT REMOVE getUser() - it's required for RLS and session refreshes
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 1. Auth Paths (Redirect to dashboard if already logged in)
    const isAuthPath = path.startsWith('/sign-in') || path.startsWith('/sign-up') || path.startsWith('/forgot-password')
    if (isAuthPath && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. Protected Paths (Redirect to sign-in if not logged in)
    const protectedPaths = ['/dashboard', '/instructor', '/admin', '/learn', '/settings']
    const isProtectedPath = protectedPaths.some(p => path.startsWith(p))

    if (isProtectedPath && !user) {
        const redirectUrl = new URL('/sign-in', request.url)
        redirectUrl.searchParams.set('redirect', path)
        return NextResponse.redirect(redirectUrl)
    }

    // 3. Role-Based Access Control (RBAC)
    if (user) {
        // We fetching profile for admin/instructor routes to verify role
        if (path.startsWith('/admin') || path.startsWith('/instructor')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            // Block non-admins from /admin
            if (path.startsWith('/admin') && profile?.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }

            // Block students from /instructor
            if (path.startsWith('/instructor') && profile?.role === 'student') {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets
         * - api/webhooks (handle webhooks without middleware auth check)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
