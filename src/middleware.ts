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

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes
    const protectedPaths = ['/dashboard', '/instructor', '/admin', '/learn']
    const authPaths = ['/sign-in', '/sign-up']
    const path = request.nextUrl.pathname

    const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
    const isAuthPath = authPaths.some(p => path.startsWith(p))

    // Redirect to login if accessing protected route without session
    if (isProtectedPath && !user) {
        const redirectUrl = new URL('/sign-in', request.url)
        redirectUrl.searchParams.set('redirect', path)
        return NextResponse.redirect(redirectUrl)
    }

    // Redirect to courses if accessing auth pages with active session
    if (isAuthPath && user) {
        return NextResponse.redirect(new URL('/courses', request.url))
    }

    // Role-based access control
    if (user && (path.startsWith('/admin') || path.startsWith('/instructor'))) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        // Instructor-only routes
        if (path.startsWith('/instructor') && profile?.role !== 'instructor' && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Admin-only routes
        if (path.startsWith('/admin') && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/instructor/:path*',
        '/admin/:path*',
        '/learn/:path*',
        '/sign-in',
        '/sign-up',
    ],
}
