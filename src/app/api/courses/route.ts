
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = createServiceClient()

        // 1. Fetch published courses
        const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })

        if (coursesError) {
            console.error('Error fetching courses:', coursesError)
            return NextResponse.json({ error: coursesError.message }, { status: 500 })
        }

        if (!coursesData || coursesData.length === 0) {
            return NextResponse.json({ courses: [], categories: [] })
        }

        // 2. Fetch related data (Instructors & Categories)
        const instructorIds = [...new Set(coursesData.map((c: any) => c.instructor_id).filter(Boolean))] as string[]
        const categoryIds = [...new Set(coursesData.map((c: any) => c.category_id).filter(Boolean))] as string[]

        // Parallel fetch
        const [instructorsResult, categoriesResult] = await Promise.all([
            supabase.from('profiles').select('id, full_name').in('id', instructorIds),
            supabase.from('categories').select('*').in('id', categoryIds) // Fetch full category data for filtering
        ])

        if (instructorsResult.error) console.error('Error fetching instructors:', instructorsResult.error)
        if (categoriesResult.error) console.error('Error fetching categories:', categoriesResult.error)

        const instructorsData = instructorsResult.data || []
        const categoriesData = categoriesResult.data || [] // These are the categories used by courses

        // Also fetch ALL categories for the filter dropdown, effectively bypassing RLS for categories too
        // (Optimally this should be a separate call or route, but bundling here ensures consistency)
        const { data: allCategories } = await supabase.from('categories').select('*').order('name')


        // 3. Map data
        const instructorMap = new Map(instructorsData.map((i: any) => [i.id, i.full_name]))
        const categoryMap = new Map(categoriesData.map((c: any) => [c.id, c.name]))

        const formattedCourses = coursesData.map((course: any) => ({
            ...course,
            instructor_name: instructorMap.get(course.instructor_id) || 'Anonymous',
            category_name: categoryMap.get(course.category_id) || 'Uncategorized'
        }))

        return NextResponse.json({
            courses: formattedCourses,
            categories: allCategories || categoriesData // Return all categories if available, else just the used ones
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
