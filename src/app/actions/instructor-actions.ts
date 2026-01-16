'use server'

import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { checkIsInstructor } from '@/lib/access-control'

/**
 * Reorder sections within a course
 */
export async function reorderSections(courseId: string, sections: { id: string; order_index: number }[]) {
    await checkIsInstructor()
    const supabase = createServiceClient()

    const { error } = await supabase.rpc('reorder_course_sections', {
        p_course_id: courseId,
        p_sections: sections
    })

    // If RPC doesn't exist yet, fallback to loop (though RPC is better for transational atomicity)
    if (error && (error.code === 'P0001' || error.message?.includes('function'))) {
        for (const section of sections) {
            await supabase
                .from('course_sections')
                .update({ order_index: section.order_index })
                .eq('id', section.id)
                .eq('course_id', courseId)
        }
    } else if (error) {
        throw error
    }

    revalidatePath(`/instructor/courses/${courseId}/curriculum`)
    return { success: true }
}

/**
 * Reorder lessons across sections
 */
export async function reorderLessonsAcrossSections(
    courseId: string,
    lessons: { id: string; section_id: string; order_index: number }[]
) {
    await checkIsInstructor()
    const supabase = createServiceClient()

    // Loop for now, as Supabase doesn't have a built-in batch update for different IDs in one call easily without RPC
    for (const lesson of lessons) {
        await supabase
            .from('lessons')
            .update({
                section_id: lesson.section_id,
                order_index: lesson.order_index
            })
            .eq('id', lesson.id)
            .eq('course_id', courseId)
    }

    revalidatePath(`/instructor/courses/${courseId}/curriculum`)
    revalidatePath(`/learn/${courseId}`)
    return { success: true }
}

/**
 * Create a new section
 */
export async function createSection(courseId: string, title: string, orderIndex: number) {
    await checkIsInstructor()
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('course_sections')
        .insert({
            course_id: courseId,
            title,
            order_index: orderIndex
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath(`/instructor/courses/${courseId}/curriculum`)
    return { success: true, section: data }
}

/**
 * Delete a section and move its lessons to "unassigned" or delete them
 */
export async function deleteSection(courseId: string, sectionId: string) {
    await checkIsInstructor()
    const supabase = createServiceClient()

    const { error } = await supabase
        .from('course_sections')
        .delete()
        .eq('id', sectionId)
        .eq('course_id', courseId)

    if (error) throw error
    revalidatePath(`/instructor/courses/${courseId}/curriculum`)
    return { success: true }
}

/**
 * Fetch curriculum for a course
 */
export async function getCurriculum(courseId: string) {
    const supabase = createServiceClient()

    // Fetch sections
    const { data: sections, error: sError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')

    if (sError) throw sError

    // Fetch lessons
    const { data: lessons, error: lError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')

    if (lError) throw lError

    // Group lessons by section
    const structuredCurriculum = sections.map(section => ({
        ...section,
        lessons: lessons.filter(l => l.section_id === section.id)
    }))

    // Handle unassigned lessons if any
    const unassignedLessons = lessons.filter(l => !l.section_id)

    return {
        sections: structuredCurriculum,
        unassignedLessons
    }
}
