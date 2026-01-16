import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        console.log('Checking Razorpay Keys...')
        console.log('KEY_ID Exists:', !!process.env.RAZORPAY_KEY_ID || !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
        console.log('KEY_SECRET Exists:', !!process.env.RAZORPAY_KEY_SECRET)

        const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        const key_secret = process.env.RAZORPAY_KEY_SECRET

        if (!key_id || !key_secret) {
            console.error('Razorpay keys missing:', { key_id: !!key_id, key_secret: !!key_secret })
            return NextResponse.json({ error: 'Razorpay keys are missing in server configuration' }, { status: 500 })
        }

        const razorpay = new Razorpay({
            key_id,
            key_secret,
        })

        try {
            const { courseId, userId } = await request.json()

            const supabase = createServiceClient()

            // Get course details
            const { data: course, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single()

            if (courseError || !course) {
                return NextResponse.json({ error: 'Course not found' }, { status: 404 })
            }

            // Check if already enrolled
            const { data: existingEnrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .single()

            if (existingEnrollment) {
                return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
            }

            // Create Razorpay order
            // Note: Razorpay uses smallest currency unit (cents/paise). 
            // Since we are using USD, we multiply by 100.
            const order = await razorpay.orders.create({
                amount: Math.round(course.price * 100),
                currency: 'USD',
                receipt: `receipt_${Date.now()}`,
                notes: {
                    courseId,
                    userId,
                },
            })

            // Create pending payment record
            await supabase.from('payments').insert({
                user_id: userId,
                course_id: courseId,
                amount: course.price,
                currency: 'USD',
                payment_method: 'razorpay',
                razorpay_order_id: order.id,
                status: 'pending',
            })

            return NextResponse.json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: key_id
            })
        } catch (error: any) {
            console.error('Razorpay Order error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
    } catch (error: any) {
        console.error('Razorpay Init error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
