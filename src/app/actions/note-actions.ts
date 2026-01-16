'use server'

import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function createNote(data: {
    userId: string
    courseId: string
    lessonId: string
    content: string
    timestampSeconds?: number
}) {
    const supabase = createServiceClient()

    const { data: note, error } = await supabase
        .from('lesson_notes')
        .insert({
            user_id: data.userId,
            course_id: data.courseId,
            lesson_id: data.lessonId,
            content: data.content,
            timestamp_seconds: data.timestampSeconds
        })
        .select()
        .single()

    if (error) throw error
    return { success: true, note }
}

export async function deleteNote(noteId: string) {
    const supabase = createServiceClient()

    const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('id', noteId)

    if (error) throw error
    return { success: true }
}

export async function getLessonNotes(userId: string, lessonId: string) {
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .order('timestamp_seconds', { ascending: true })

    if (error) throw error
    return data
}
