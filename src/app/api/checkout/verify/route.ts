import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json()

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: '2024-12-18.acacia' as any,
        })

        // Retrieve session to verify payment
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
        }

        const { courseId, userId } = session.metadata!

        const supabase = createServiceClient()

        // 1. Update payment record
        await supabase
            .from('payments')
            .update({ status: 'succeeded' })
            .eq('stripe_payment_intent_id', session.id)

        // 2. Check if already enrolled
        const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single()

        if (!existing) {
            // 3. Create enrollment
            const { error: insertError } = await supabase.from('enrollments').insert({
                user_id: userId,
                course_id: courseId,
            })

            if (insertError) {
                console.error("Enrollment insert error:", insertError)
                return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Verification error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
