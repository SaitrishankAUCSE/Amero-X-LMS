import { createBrowserClient } from '@/lib/supabase'

export interface User {
    id: string
    email: string
    role: 'student' | 'instructor' | 'admin'
    full_name?: string
    avatar_url?: string
}

// Sign up new user
export async function signUp(email: string, password: string, fullName: string) {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                terms_accepted: true,
                terms_accepted_at: new Date().toISOString()
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/auth/callback`,
        },
    })

    if (error) throw error

    // Profile is automatically created by database trigger
    return data
}

// Sign in existing user
export async function signIn(email: string, password: string) {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error
    return data
}

// Sign out
export async function signOut(scope: 'global' | 'local' = 'local') {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut({ scope })
    if (error) throw error
}

// Get current user with profile
export async function getCurrentUser(): Promise<User | null> {
    const supabase = createBrowserClient()

    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
            throw error
        }
        console.log('getCurrentUser found:', user?.email)
        if (!user) return null

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.warn('Profile missing for user:', user.id)
        }

        // Return profile data if available, otherwise fallback to auth metadata
        return {
            id: user.id,
            email: user.email!,
            role: profile ? (profile as any).role : 'student',
            full_name: profile ? (profile as any).full_name : user.user_metadata?.full_name,
            avatar_url: profile ? (profile as any).avatar_url : user.user_metadata?.avatar_url,
        }
    } catch (error: any) {
        if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('signal is aborted')) {
            return null
        }
        // Only log real errors
        if (error.message !== 'Auth session missing!') {
            // supabase sometimes throws this if no session
            // console.error('Error getting current user:', error)
        }
        return null
    }
}

// Reset password request
export async function resetPassword(email: string) {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/reset-password`,
    })

    if (error) throw error
}

// OAuth Sign In
export async function signInWithOAuth(provider: 'google' | 'github') {
    const supabase = createBrowserClient()

    // Determine the correct origin for the redirect
    // Use window.location.origin to ensure we redirect back to the exact same domain (including www vs non-www)
    const origin = (typeof window !== 'undefined')
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || 'https://ameroxfoundation.com'
    const redirectTo = `${origin}/api/auth/callback`

    console.log(`Attempting OAuth sign in with ${provider}, redirecting to: ${redirectTo}`)

    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo,
            queryParams: {
                access_type: 'offline',
                prompt: 'select_account',
            },
        },
    })

    if (error) {
        console.error(`OAuth error for ${provider}:`, error)
        throw error
    }
}

// Update password
export async function updatePassword(newPassword: string) {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) throw error
}

// Check if user is enrolled in course
export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const supabase = createBrowserClient()

    const { data } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single()

    return !!data
}
