'use server'

import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateLessonProgress(data: {
    userId: string
    courseId: string
    lessonId: string
    status?: 'not_started' | 'in_progress' | 'completed'
    videoProgress?: number
}) {
    const supabase = createServiceClient()

    const { error } = await supabase
        .from('lesson_progress')
        .upsert({
            user_id: data.userId,
            course_id: data.courseId,
            lesson_id: data.lessonId,
            status: data.status || 'in_progress',
            video_progress_seconds: data.videoProgress || 0,
            last_accessed_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,lesson_id'
        })

    if (error) {
        console.error('Error updating progress:', error)
        throw error
    }

    // Also update the overall enrollment progress if completed
    if (data.status === 'completed') {
        // Fetch total lessons
        const { count: totalLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', data.courseId)

        // Fetch completed lessons
        const { count: completedLessons } = await supabase
            .from('lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', data.userId)
            .eq('course_id', data.courseId)
            .eq('status', 'completed')

        if (totalLessons && completedLessons !== null) {
            const percentage = Math.round((completedLessons / totalLessons) * 100)

            await supabase
                .from('enrollments')
                .update({
                    progress_percentage: percentage,
                    completed_at: percentage === 100 ? new Date().toISOString() : null
                })
                .eq('user_id', data.userId)
                .eq('course_id', data.courseId)
        }
    }

    return { success: true }
}

export async function getLessonProgress(userId: string, lessonId: string) {
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}
