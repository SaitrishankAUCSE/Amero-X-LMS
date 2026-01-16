import { Suspense } from 'react'
import { getCurriculum } from '@/app/actions/instructor-actions'
import { createServiceClient } from '@/lib/supabase'
import { EnhancedCurriculumBuilder } from '@/components/instructor/curriculum-builder'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CurriculumPage({ params }: PageProps) {
    const { id: courseId } = await params
    const supabase = createServiceClient()

    // Fetch course details
    const { data: course, error } = await supabase
        .from('courses')
        .select('title, id')
        .eq('id', courseId)
        .single()

    if (error || !course) {
        notFound()
    }

    const { sections, unassignedLessons } = await getCurriculum(courseId)

    // Combine unassigned lessons into a "General" or first section if needed, 
    // or just pass them as is. The builder should handle it.
    // For this implementation, let's assume we want them in an "Unassigned" section if they exist.
    const initialSections = [...sections]
    if (unassignedLessons.length > 0) {
        initialSections.unshift({
            id: 'unassigned',
            title: 'Unassigned Lessons',
            order_index: 0,
            lessons: unassignedLessons as any[]
        } as any)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/instructor/courses/${courseId}`}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <div>
                            <h1 className="text-lg font-bold truncate max-w-[300px]">{course.title}</h1>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <BookOpen className="w-3 h-3" />
                                <span>Curriculum Management</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center gap-2"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="py-12 pb-24">
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                }>
                    <EnhancedCurriculumBuilder
                        courseId={courseId}
                        initialSections={initialSections as any}
                    />
                </Suspense>
            </main>
        </div>
    )
}
