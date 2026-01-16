const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function promote() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const email = 'saitrishankb9@gmail.com'

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing env variables')
        return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Promoting ${email} to admin...`)

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
        console.error('Auth error:', authError)
        return
    }

    const user = users.find(u => u.email === email)
    if (!user) {
        console.error('User not found')
        return
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

    if (profileError) {
        console.error('Profile error:', profileError)
    } else {
        console.log('Success! User promoted to admin.')
    }
}

promote()
