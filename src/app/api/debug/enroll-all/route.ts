import { createServiceClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { userId } = await request.json()
        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

        const supabase = createServiceClient()

        // 1. Get all courses
        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id')

        if (coursesError) throw coursesError

        // 2. Bulk enroll user in all courses
        const enrollments = courses.map(course => ({
            user_id: userId,
            course_id: course.id,
            enrolled_at: new Date().toISOString(),
        }))

        const { error: enrollError } = await supabase
            .from('enrollments')
            .upsert(enrollments, { onConflict: 'user_id, course_id' })

        if (enrollError) throw enrollError

        return NextResponse.json({ message: 'Success! You are now enrolled in all courses.' })
    } catch (error: any) {
        console.error('Seed enrollment error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
