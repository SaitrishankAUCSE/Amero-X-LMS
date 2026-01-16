import { createServiceClient } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/admin'
import { LessonForm } from '@/components/admin/lesson-form'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
    params: Promise<{ courseId: string; lessonId: string }>
}

export default async function EditLessonPage({ params }: PageProps) {
    await checkIsAdmin()
    const { courseId, lessonId } = await params
    const supabase = createServiceClient()

    const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

    if (!lesson) {
        return <div>Lesson not found</div>
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            <Navbar />

            <div className="container mx-auto py-8 px-4">
                <Link
                    href={`/admin/courses/${courseId}/lessons`}
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Lessons
                </Link>

                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            Edit Lesson
                        </h1>
                        <p className="text-gray-500 mt-1">Update content for "{lesson.title}"</p>
                    </div>

                    <LessonForm courseId={courseId} initialData={lesson} />
                </div>
            </div>
        </main>
    )
}
