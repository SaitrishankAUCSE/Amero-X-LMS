'use client'

import { useState } from 'react'
import { createLessonWithPDF, updateLesson } from '@/app/actions/admin-courses'
import { FileUpload } from './file-upload'
import { Loader2, Plus, Save, Trash, FileText, Video, File, Mic, BookOpen, ClipboardList } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface LessonFormProps {
    courseId: string
    initialData?: any
    onSuccess?: () => void
}

type LessonType = 'video' | 'text' | 'quiz' | 'assignment' | 'pdf' | 'audio'

export function LessonForm({ courseId, initialData, onSuccess }: LessonFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [lessonType, setLessonType] = useState<LessonType>(initialData?.type || 'video')

    // State for different content types
    const [videoUrl, setVideoUrl] = useState(initialData?.video_url || '')
    const [pdfUrl, setPdfUrl] = useState(initialData?.type === 'pdf' ? initialData?.content_url : '')
    const [audioUrl, setAudioUrl] = useState(initialData?.type === 'audio' ? initialData?.content_url : '')
    const [textContent, setTextContent] = useState(initialData?.text_content || '')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.append('course_id', courseId)
            formData.append('type', lessonType)

            // Map content based on type
            if (lessonType === 'video') formData.append('video_url', videoUrl)
            if (lessonType === 'pdf') {
                formData.append('content_url', pdfUrl)
                // Legacy support: also append to description for now if needed, handled by server action
                formData.append('pdf_url', pdfUrl)
            }
            if (lessonType === 'audio') formData.append('content_url', audioUrl)
            if (lessonType === 'text') formData.append('text_content', textContent)

            // Quiz and Assignment data would be handled here (JSON stringified)

            if (initialData) {
                formData.append('is_free', (e.currentTarget.elements.namedItem('is_free') as HTMLInputElement).checked.toString())
                const result = await updateLesson(initialData.id, formData)
                if (result.success) {
                    toast.success('Lesson updated successfully')
                    router.push(`/admin/courses/${courseId}/lessons`)
                    router.refresh()
                }
            } else {
                const result = await createLessonWithPDF(formData)
                if (result.success) {
                    (e.target as HTMLFormElement).reset()
                    setVideoUrl('')
                    setPdfUrl('')
                    setTextContent('')
                    toast.success('Lesson added successfully')
                    onSuccess?.()
                    router.refresh()
                }
            }
        } catch (error) {
            console.error('Lesson save error:', error)
            toast.error('Failed to save lesson')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
                {initialData ? <Save className="h-5 w-5 text-indigo-600" /> : <Plus className="h-5 w-5 text-indigo-600" />}
                {initialData ? 'Edit Lesson' : 'Add New Lesson'}
            </h3>

            <div className="space-y-4">
                {/* Type Selector */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                        { id: 'video', icon: Video, label: 'Video' },
                        { id: 'text', icon: FileText, label: 'Text' },
                        { id: 'pdf', icon: File, label: 'PDF' },
                        { id: 'audio', icon: Mic, label: 'Audio' },
                        { id: 'quiz', icon: BookOpen, label: 'Quiz' },
                        { id: 'assignment', icon: ClipboardList, label: 'Task' },
                    ].map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setLessonType(type.id as LessonType)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${lessonType === type.id
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/50 dark:text-indigo-400'
                                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-500'
                                }`}
                        >
                            <type.icon className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">{type.label}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase text-gray-400">Lesson Title</label>
                            <input
                                name="title"
                                defaultValue={initialData?.title}
                                required
                                placeholder="e.g. Introduction to React"
                                className="input-field"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase text-gray-400">Order Index</label>
                            <input
                                name="order_index"
                                type="number"
                                defaultValue={initialData?.order_index || 1}
                                required
                                className="input-field"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                name="is_free"
                                value="true"
                                defaultChecked={initialData?.is_free}
                                id="is_free"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_free" className="text-sm font-medium">Free Preview Lesson?</label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Dynamic Content Fields based on Type */}
                        {lessonType === 'video' && (
                            <FileUpload
                                label="Lesson Video"
                                onUploadComplete={setVideoUrl}
                                accept="video/*"
                            />
                        )}

                        {lessonType === 'pdf' && (
                            <FileUpload
                                label="PDF Document"
                                onUploadComplete={setPdfUrl}
                                accept=".pdf"
                            />
                        )}

                        {lessonType === 'audio' && (
                            <FileUpload
                                label="Audio File"
                                onUploadComplete={setAudioUrl}
                                accept="audio/*"
                            />
                        )}

                        {lessonType === 'text' && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase text-gray-400">Article Content</label>
                                <textarea
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                    rows={8}
                                    placeholder="Write your lesson content here..."
                                    className="input-field font-mono text-sm"
                                />
                            </div>
                        )}

                        {(lessonType === 'quiz' || lessonType === 'assignment') && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-semibold mb-1">Coming Soon</p>
                                {lessonType === 'quiz' ? 'Quiz Builder' : 'Assignment Manager'} will be implemented in the next update.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-gray-400">Description / Notes</label>
                    <textarea
                        name="description"
                        defaultValue={initialData?.description}
                        rows={3}
                        className="input-field resize-none"
                        placeholder="Briefly describe what this lesson covers..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                {initialData && (
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:opacity-90 transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (initialData ? 'Save Changes' : 'Add Lesson')}
                </button>
            </div>
        </form>
    )
}

