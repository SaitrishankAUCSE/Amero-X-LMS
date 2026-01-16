import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Stripe keys are missing' }, { status: 500 })
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia' as any,
        })

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

        // Handle Free Courses
        if (course.price === 0) {
            const { error: enrollmentError } = await supabase
                .from('enrollments')
                .insert({
                    user_id: userId,
                    course_id: courseId
                })

            if (enrollmentError) {
                return NextResponse.json({ error: enrollmentError.message }, { status: 500 })
            }

            return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.slug}` })
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: course.title,
                            description: course.short_description || 'Learn with Amero X',
                            images: course.thumbnail_url ? [course.thumbnail_url] : [],
                        },
                        unit_amount: Math.round(course.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.slug}`,
            metadata: {
                courseId,
                userId,
            },
        })

        // Create pending payment record
        await supabase.from('payments').insert({
            user_id: userId,
            course_id: courseId,
            amount: course.price,
            currency: 'INR',
            payment_method: 'stripe',
            stripe_payment_intent_id: session.id,
            status: 'pending',
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error: any) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
