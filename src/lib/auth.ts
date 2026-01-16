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
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
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
export async function signOut() {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

// Get current user with profile
export async function getCurrentUser(): Promise<User | null> {
    const supabase = createBrowserClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    return {
        id: user.id,
        email: user.email!,
        role: (profile as any).role,
        full_name: (profile as any).full_name,
        avatar_url: (profile as any).avatar_url,
    }
}

// Reset password request
export async function resetPassword(email: string) {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
}

// OAuth Sign In
export async function signInWithOAuth(provider: 'google' | 'github') {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    if (error) throw error
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
