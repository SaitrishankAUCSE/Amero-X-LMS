import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
        }

        // Simulate external API call (e.g. Mailchimp, SendGrid)
        console.log(`New newsletter subscription: ${email}`)

        return NextResponse.json({ success: true, message: 'Subscribed successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
