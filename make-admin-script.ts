import { createServiceClient } from './src/lib/supabase'

async function makeAdmin(email: string) {
    const supabase = createServiceClient()

    console.log(`Searching for user with email: ${email}...`)

    // 1. Get user ID from email (Note: service role can access auth.users indirectly if needed, 
    // but we can just use the profiles table if email is stored there or join)
    // Actually, profiles table usually stores the email or we can find the profile by ID.
    // Let's find the user in auth first.

    const { data: { users }, error: authError } = await (supabase.auth as any).admin.listUsers()

    if (authError) {
        console.error('Error listing users:', authError)
        return
    }

    const user = users.find((u: any) => u.email === email)

    if (!user) {
        console.error(`User with email ${email} not found in Auth.`)
        return
    }

    console.log(`Found user ID: ${user.id}. Updating role to 'admin'...`)

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

    if (profileError) {
        console.error('Error updating profile:', profileError)
    } else {
        console.log(`Success! ${email} is now an admin.`)
    }
}

const email = 'saitrishankb9@gmail.com'
makeAdmin(email)
