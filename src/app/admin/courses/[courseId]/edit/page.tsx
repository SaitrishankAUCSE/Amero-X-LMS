import { createServiceClient } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/admin'
import { CourseForm } from '@/components/admin/course-form'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
    params: Promise<{ courseId: string }>
}

export default async function EditCoursePage({ params }: PageProps) {
    await checkIsAdmin()
    const { courseId } = await params
    const supabase = createServiceClient()

    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

    if (!course) {
        return <div>Course not found</div>
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="container mx-auto py-12 px-4">
                <Link
                    href="/admin/courses"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Edit Course
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Update {course.title} and manage pricing
                    </p>
                </div>

                <CourseForm
                    categories={categories || []}
                    initialData={course}
                />
            </div>
        </main>
    )
}
