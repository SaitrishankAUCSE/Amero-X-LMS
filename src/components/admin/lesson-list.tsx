import { Play, FileText, CheckCircle2, Edit } from 'lucide-react'
import Link from 'next/link'

interface Lesson {
    id: string
    course_id: string
    title: string
    order_index: number
    video_url?: string | null
    description?: string | null
}

interface LessonListProps {
    lessons: Lesson[]
}

export function LessonList({ lessons }: LessonListProps) {
    if (lessons.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-gray-500">No lessons added yet. Use the form above to get started!</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {lessons.map((lesson) => (
                <div
                    key={lesson.id}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group"
                >
                    <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {lesson.order_index}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{lesson.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                            {lesson.video_url && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-500">
                                    <Play className="h-3 w-3" /> Video Attached
                                </span>
                            )}
                            {lesson.description?.includes('Download PDF') && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-500">
                                    <FileText className="h-3 w-3" /> PDF Loaded
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/admin/courses/${lesson.course_id}/lessons/${lesson.id}/edit`}
                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Edit Lesson"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                        <CheckCircle2 className="h-5 w-5 text-gray-200 group-hover:text-green-500 transition-colors" />
                    </div>
                </div>
            ))}
        </div>
    )
}
