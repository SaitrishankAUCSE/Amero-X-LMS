import { createServiceClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const supabase = createServiceClient()

        // Use listUsers to find by email. 
        // Note: In some Supabase setups, getting a user by email via admin might vary, 
        // but listUsers is standard.
        // Optimized: We can use listUsers with a filter if supported, or just fetch and find.
        // Better yet, generate a link or try to get user by ID isn't possible without ID.
        // `admin.listUsers` is the way.

        // However, listUsers might be slow if there are thousands. 
        // Attempting to create a "shadow" check or using `from('profiles')` 
        // is faster if profiles are synced. Let's check profiles table first as it is public/accessible by service role easily.

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email) // Assuming email is not in profiles schema based on previous reads, let's verify.
        // If email is NOT in profiles, we must check auth.users.

        // Let's use auth.admin.listUsers() searching for the email.
        const { data, error } = await supabase.auth.admin.listUsers()

        if (error) {
            throw error
        }

        const userExists = data.users.some(u => u.email?.toLowerCase() === email.toLowerCase())

        return NextResponse.json({ exists: userExists })

    } catch (error: any) {
        console.error('Check email error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
