
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
    try {
        const supabase = createServiceClient()
        const slug = params.slug

        // 1. Fetch Course with Profile & Category
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('slug', slug)
            .single()

        if (courseError || !course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        // Fetch instructor
        const { data: instructor } = await supabase
            .from('profiles')
            .select('full_name, bio, avatar_url')
            .eq('id', course.instructor_id)
            .single()

        // Fetch category
        let categoryName = 'Uncategorized'
        if (course.category_id) {
            const { data: cat } = await supabase.from('categories').select('name').eq('id', course.category_id).single()
            if (cat) categoryName = cat.name
        }

        const enrichedCourse = {
            ...course,
            profiles: instructor,
            categories: { name: categoryName }
        }

        // 2. Fetch Lessons
        const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', course.id)
            .order('order_index')

        // 3. Fetch Reviews
        const { data: reviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('course_id', course.id)
            .order('created_at', { ascending: false })
            .limit(5)

        // Enrich reviews with profiles
        let enrichedReviews = []
        if (reviews && reviews.length > 0) {
            const userIds = [...new Set(reviews.map((r: any) => r.user_id))] as string[]
            const { data: reviewers } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
            const reviewerMap = new Map(reviewers?.map((r: any) => [r.id, r]) || [])

            enrichedReviews = reviews.map((r: any) => ({
                ...r,
                profiles: reviewerMap.get(r.user_id) || { full_name: 'Anonymous' }
            }))
        }

        return NextResponse.json({
            course: enrichedCourse,
            lessons: lessons || [],
            reviews: enrichedReviews
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
