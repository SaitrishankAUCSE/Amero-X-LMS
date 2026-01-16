'use server'

import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { checkIsAdmin } from '@/lib/admin'

export async function createCourse(formData: FormData) {
    const user = await checkIsAdmin()
    const supabase = createServiceClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const short_description = formData.get('short_description') as string
    const price = parseFloat(formData.get('price') as string)
    const category_id = formData.get('category_id') as string
    const level = formData.get('level') as 'beginner' | 'intermediate' | 'advanced'
    const language = formData.get('language') as string
    const thumbnail_url = formData.get('thumbnail_url') as string
    const preview_video_url = formData.get('preview_video_url') as string

    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now()

    const { data, error } = await supabase
        .from('courses')
        .insert({
            title,
            slug,
            description,
            short_description,
            price,
            instructor_id: user.id,
            category_id: category_id || null,
            level,
            language: language || 'English',
            is_published: true,
            thumbnail_url,
            preview_video_url
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating course:', error)
        throw new Error('Failed to create course')
    }

    revalidatePath('/courses')
    revalidatePath('/admin')

    return { success: true, courseId: data.id }
}

// Types for lesson creation and updates
interface CreateLessonData {
    course_id: string
    title: string
    description: string
    video_url?: string // Legacy
    pdf_url?: string // Legacy
    content_url?: string
    text_content?: string
    type?: string
    order_index: number
    is_free: boolean
}

export async function createLessonWithPDF(formData: FormData) {

    await checkIsAdmin()
    const supabase = createServiceClient()

    const course_id = formData.get('course_id') as string
    const title = formData.get('title') as string
    let description = formData.get('description') as string
    const video_url = formData.get('video_url') as string
    const pdf_url = formData.get('pdf_url') as string
    const content_url = formData.get('content_url') as string
    const text_content = formData.get('text_content') as string
    const type = formData.get('type') as string || 'video'
    const order_index = parseInt(formData.get('order_index') as string)
    const is_free = formData.get('is_free') === 'true'

    // Legacy support: If PDF exists but no type, set type to pdf or video if video exists
    // This logic is simplified by front-end passing 'type' explicitly now.

    const { error } = await supabase
        .from('lessons')
        .insert({
            course_id,
            title,
            description,
            video_url, // Keep for backward compatibility
            content_url: content_url || video_url || pdf_url, // Unified content URL
            text_content,
            type,
            order_index,
            is_free
        })

    if (error) {
        console.error('Error creating lesson:', error)
        throw new Error('Failed to create lesson')
    }

    revalidatePath(`/admin/courses/${course_id}/lessons`)
    return { success: true }
}

export async function updateCourse(courseId: string, formData: FormData) {
    await checkIsAdmin()
    const supabase = createServiceClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const short_description = formData.get('short_description') as string
    const price = parseFloat(formData.get('price') as string)
    const category_id = formData.get('category_id') as string
    const level = formData.get('level') as 'beginner' | 'intermediate' | 'advanced'
    const language = formData.get('language') as string
    const thumbnail_url = formData.get('thumbnail_url') as string
    const preview_video_url = formData.get('preview_video_url') as string
    const is_published = formData.get('is_published') === 'true'

    const { error } = await supabase
        .from('courses')
        .update({
            title,
            description,
            short_description,
            price,
            category_id: category_id || null,
            level,
            language: language || 'English',
            is_published,
            thumbnail_url,
            preview_video_url,
            updated_at: new Date().toISOString()
        })
        .eq('id', courseId)

    if (error) {
        console.error('Error updating course:', error)
        throw new Error('Failed to update course')
    }

    revalidatePath('/courses')
    revalidatePath('/admin/courses')
    revalidatePath(`/courses/${courseId}`)

    return { success: true }
}

export async function updateLesson(lessonId: string, formData: FormData) {
    await checkIsAdmin()
    const supabase = createServiceClient()

    const title = formData.get('title') as string
    let description = formData.get('description') as string
    const video_url = formData.get('video_url') as string
    const pdf_url = formData.get('pdf_url') as string
    const content_url = formData.get('content_url') as string
    const text_content = formData.get('text_content') as string
    const type = formData.get('type') as string
    const order_index = parseInt(formData.get('order_index') as string)
    const is_free = formData.get('is_free') === 'true'
    const course_id = formData.get('course_id') as string

    // If New PDF exists, append (or replacing logic could go here but standard is append for now)
    // Note: With new system, we rely on content_url, but we keep this for legacy description links if desired.
    // We will only append if it's explicitly a PDF type and using old logic, OR we can deprecate this.
    // For now, let's trust the new 'content_url' column for the primary link.

    const { error } = await supabase
        .from('lessons')
        .update({
            title,
            description,
            video_url,
            content_url: content_url || video_url || pdf_url,
            text_content,
            type,
            order_index,
            is_free,
            updated_at: new Date().toISOString()
        })
        .eq('id', lessonId)

    if (error) {
        console.error('Error updating lesson:', error)
        throw new Error('Failed to update lesson')
    }

    revalidatePath(`/admin/courses/${course_id}/lessons`)
    return { success: true }
}

export async function reorderLessons(items: { id: string; order_index: number }[]) {
    await checkIsAdmin()
    const supabase = createServiceClient()

    // Process updates in parallel or batch if possible, currently simple loop for safety
    for (const item of items) {
        await supabase
            .from('lessons')
            .update({ order_index: item.order_index })
            .eq('id', item.id)
    }

    revalidatePath('/admin/courses/[courseId]/lessons')
    return { success: true }
}

export async function togglePublish(courseId: string, isPublished: boolean) {
    await checkIsAdmin()
    const supabase = createServiceClient()

    const { error } = await supabase
        .from('courses')
        .update({ is_published: isPublished })
        .eq('id', courseId)

    if (error) {
        console.error('Error toggling publish status:', error)
        throw new Error('Failed to update status')
    }

    revalidatePath('/admin/courses')
    revalidatePath(`/courses/${courseId}`)
    return { success: true }
}
