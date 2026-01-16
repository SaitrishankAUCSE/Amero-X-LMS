import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: Request) {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Missing Stripe environment variables')
        return NextResponse.json({ error: 'Missing configuration' }, { status: 500 })
    }

    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return NextResponse.json({ error: err.message }, { status: 400 })
    }


    const supabase = createServiceClient()

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const { courseId, userId } = session.metadata!

        try {
            // Update payment status
            await supabase
                .from('payments')
                .update({ status: 'succeeded' })
                .eq('stripe_payment_intent_id', session.id)

            // Create enrollment
            await supabase.from('enrollments').insert({
                user_id: userId,
                course_id: courseId,
            })

            console.log(`Enrollment created for user ${userId} in course ${courseId}`)
        } catch (error) {
            console.error('Enrollment creation error:', error)
        }
    }

    return NextResponse.json({ received: true })
}
