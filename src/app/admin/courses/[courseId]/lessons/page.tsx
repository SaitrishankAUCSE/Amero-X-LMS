import { createServiceClient } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/admin'
import { LessonForm } from '@/components/admin/lesson-form'
import { CurriculumBuilder } from '@/components/admin/curriculum-builder'
import Navbar from '@/components/navbar'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
    params: Promise<{ courseId: string }>
}

export default async function CourseLessonsPage({ params }: PageProps) {
    await checkIsAdmin()
    const { courseId } = await params
    const supabase = createServiceClient()

    const { data: course } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single()

    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <Navbar />

            <div className="container mx-auto py-8 px-4">
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Courses
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Course Info & Lesson List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                {course?.title}
                            </h1>
                            <p className="text-gray-500 mt-1">Manage the curriculum and content for this course.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Curriculum</h2>
                            <CurriculumBuilder initialLessons={lessons || []} />
                        </div>
                    </div>

                    {/* Right: Add Lesson Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <LessonForm courseId={courseId} />

                            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">Publishing Tip</h4>
                                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                                    Make sure to upload high-quality videos and relevant PDFs. Lessons marked as "Free" will be accessible to everyone for preview.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
