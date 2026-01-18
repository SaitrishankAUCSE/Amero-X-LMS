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
    let user = null
    try {
        const { data } = await supabase.auth.getUser()
        user = data.user
    } catch (error: any) {
        // Ignore AbortError which can happen during rapid navigation or cancellations
        if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('signal is aborted')) {
            // treat as no user
        } else {
            console.error('Middleware auth check error:', error)
        }
    }

    const path = request.nextUrl.pathname

    // 1. Auth Paths (Redirect to dashboard if already logged in)
    const isAuthPath = path.startsWith('/sign-in') || path.startsWith('/sign-up') || path.startsWith('/forgot-password')
    if (isAuthPath && user) {
        const redirectUrl = new URL('/dashboard', request.url)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        // Copy cookies from response (which might have session updates) to redirectResponse
        response.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    // 2. Protected Paths (Redirect to sign-in if not logged in)
    const protectedPaths = ['/dashboard', '/instructor', '/admin', '/learn', '/settings']
    const isProtectedPath = protectedPaths.some(p => path.startsWith(p))

    if (isProtectedPath && !user) {
        const redirectUrl = new URL('/sign-in', request.url)
        redirectUrl.searchParams.set('redirect', path)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        // Copy cookies just in case (though less critical here since no session to save)
        response.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
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
                const redirectUrl = new URL('/dashboard', request.url)
                const redirectResponse = NextResponse.redirect(redirectUrl)
                response.cookies.getAll().forEach(cookie => {
                    redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
                })
                return redirectResponse
            }

            // Block students from /instructor
            if (path.startsWith('/instructor') && profile?.role === 'student') {
                const redirectUrl = new URL('/dashboard', request.url)
                const redirectResponse = NextResponse.redirect(redirectUrl)
                response.cookies.getAll().forEach(cookie => {
                    redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
                })
                return redirectResponse
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
