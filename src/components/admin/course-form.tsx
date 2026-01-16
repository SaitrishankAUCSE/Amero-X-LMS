'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCourse, updateCourse } from '@/app/actions/admin-courses'
import { FileUpload } from './file-upload'
import { Loader2 } from 'lucide-react'

interface Category {
    id: string
    name: string
}

interface CourseFormProps {
    categories: Category[]
    initialData?: any
}

export function CourseForm({ categories, initialData }: CourseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '')
    const [previewVideoUrl, setPreviewVideoUrl] = useState(initialData?.preview_video_url || '')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.append('thumbnail_url', thumbnailUrl)
            formData.append('preview_video_url', previewVideoUrl)

            if (initialData) {
                formData.append('is_published', (e.currentTarget.elements.namedItem('is_published') as HTMLInputElement).checked.toString())
                const result = await updateCourse(initialData.id, formData)
                if (result.success) {
                    router.push('/admin/courses')
                    router.refresh()
                }
            } else {
                const result = await createCourse(formData)
                if (result.success) {
                    router.push(`/admin/courses/${result.courseId}/lessons`)
                }
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Failed to save course. Check console for details.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {initialData ? 'Edit Course' : 'Create New Course'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {initialData ? 'Update the course details and pricing.' : 'Fill in the details below to start your new course.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold">Course Title</label>
                        <input
                            name="title"
                            defaultValue={initialData?.title}
                            required
                            placeholder="e.g. Master Clean Coding"
                            className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold">Short Description</label>
                        <input
                            name="short_description"
                            defaultValue={initialData?.short_description}
                            required
                            placeholder="A brief catchy summary..."
                            className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold">Category</label>
                        <select
                            name="category_id"
                            defaultValue={initialData?.category_id || ''}
                            className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold">Price ($)</label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={initialData?.price}
                                required
                                placeholder="49.99"
                                className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold">Level</label>
                            <select
                                name="level"
                                defaultValue={initialData?.level || 'beginner'}
                                className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {initialData && (
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                name="is_published"
                                value="true"
                                defaultChecked={initialData?.is_published}
                                id="is_published"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_published" className="text-sm font-medium">Published</label>
                        </div>
                    )}
                </div>

                {/* Media Uploads */}
                <div className="space-y-4">
                    <FileUpload
                        label="Course Thumbnail"
                        onUploadComplete={setThumbnailUrl}
                        accept="image/*"
                    />
                    {thumbnailUrl && (
                        <div className="mt-1">
                            <img src={thumbnailUrl} alt="Preview" className="h-20 w-32 object-cover rounded border" />
                        </div>
                    )}
                    <FileUpload
                        label="Preview Video (Optional)"
                        onUploadComplete={setPreviewVideoUrl}
                        accept="video/*"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Full Description</label>
                <textarea
                    name="description"
                    defaultValue={initialData?.description}
                    rows={4}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="Tell your students what they will learn..."
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {initialData ? 'Saving...' : 'Creating...'}
                        </>
                    ) : (
                        initialData ? 'Save Changes' : 'Create Course & Continue'
                    )}
                </button>
            </div>
        </form>
    )
}
