import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseId,
            userId,
        } = await request.json()

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET!
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex')

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
        }

        const supabase = createServiceClient()

        // Update payment record
        const { error: updateError } = await supabase
            .from('payments')
            .update({
                status: 'succeeded',
                razorpay_payment_id: razorpay_payment_id,
            })
            .eq('razorpay_order_id', razorpay_order_id)

        if (updateError) {
            console.error('Payment update error:', updateError)
            return NextResponse.json({ error: 'Failed to update payment record' }, { status: 500 })
        }

        // Create enrollment
        const { error: enrollmentError } = await supabase
            .from('enrollments')
            .insert({
                user_id: userId,
                course_id: courseId,
            })

        if (enrollmentError) {
            console.error('Enrollment error:', enrollmentError)
            // Even if enrollment fails here, the payment was successful. 
            // In a real app, you'd handle this with weightier logic or retries.
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Razorpay Verify error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
