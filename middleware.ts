import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    console.log('[Middleware] Path:', request.nextUrl.pathname, 'User:', user?.email ? 'Logged In' : 'Guest')

    // If user is logged in and trying to access sign-in or sign-up pages
    if (user && (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up')) {
        return NextResponse.redirect(new URL('/courses', request.url))
    }

    // Protected routes - redirect to sign-in if not authenticated
    const protectedPaths = ['/dashboard', '/instructor', '/admin']
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (isProtectedPath && !user) {
        const redirectUrl = new URL('/sign-in', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        redirectUrl.searchParams.set('message', 'Please sign in to access this page')
        return NextResponse.redirect(redirectUrl)
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
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
