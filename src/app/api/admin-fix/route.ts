import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
    try {
        const supabase = createServiceClient()
        const email = 'saitrishankb9@gmail.com'

        console.log(`API Fix: Promoting ${email} to admin...`)

        // 1. Get all users to find the ID
        const { data: { users }, error: authError } = await (supabase.auth as any).admin.listUsers()
        if (authError) throw authError

        const user = users.find((u: any) => u.email === email)
        if (!user) {
            return NextResponse.json({ error: 'User not found in Auth' }, { status: 404 })
        }

        // 2. Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id)

        if (profileError) throw profileError

        return NextResponse.json({
            success: true,
            message: `User ${email} (ID: ${user.id}) has been promoted to admin.`
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
