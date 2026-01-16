import { createServiceClient } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/admin'
import Link from 'next/link'
import { Plus, Edit, BookOpen, Layers, DollarSign, Eye, EyeOff } from 'lucide-react'
import { togglePublish } from '@/app/actions/admin-courses'

export default async function AdminCoursesPage() {
    await checkIsAdmin()
    const supabase = createServiceClient()

    const { data: courses } = await supabase
        .from('courses')
        .select(`
            *,
            categories(name),
            lessons(count)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
                    <p className="text-gray-500 text-sm">Create, approve, and manage courses.</p>
                </div>
                <Link
                    href="/admin/courses/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Course
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Course</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Stats</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Price</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Status (Approval)</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {courses?.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {course.thumbnail_url ? (
                                                <img
                                                    src={course.thumbnail_url}
                                                    alt=""
                                                    className="h-10 w-16 object-cover rounded shadow-sm border border-gray-100 dark:border-gray-700"
                                                />
                                            ) : (
                                                <div className="h-10 w-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                                    <Layers className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{course.short_description || 'No description'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                                            {(course.categories as any)?.name || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            {course.lessons?.[0]?.count || 0} lessons
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        ${course.price?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <form action={async () => {
                                            'use server'
                                            await togglePublish(course.id, !course.is_published)
                                        }}>
                                            <button
                                                type="submit"
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${course.is_published
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'
                                                    }`}
                                            >
                                                {course.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                                {course.is_published ? 'Published' : 'Draft'}
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/courses/${course.id}/edit`}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                title="Edit Settings"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/admin/courses/${course.id}/lessons`}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                title="Manage Curriculum"
                                            >
                                                <BookOpen className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!courses || courses.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No courses found. Start by creating your first course!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
