'use server'

import { createServiceClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { checkIsInstructor } from '@/lib/access-control'

export async function createQuiz(data: {
    course_id: string
    title: string
    description?: string
    passing_score?: number
}) {
    await checkIsInstructor()
    const supabase = createServiceClient()

    const { data: quiz, error } = await supabase
        .from('quizzes')
        .insert({
            course_id: data.course_id,
            title: data.title,
            description: data.description,
            passing_score: data.passing_score || 70,
        })
        .select()
        .single()

    if (error) throw error
    return { success: true, quiz }
}

export async function addQuestion(quizId: string, question: {
    question_text: string
    question_type: 'multiple_choice' | 'true_false' | 'short_answer'
    options?: any[]
    correct_answer: string
    explanation?: string
    points?: number
    order_index: number
}) {
    await checkIsInstructor()
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('quiz_questions')
        .insert({
            quiz_id: quizId,
            ...question
        })
        .select()
        .single()

    if (error) throw error
    return { success: true, question: data }
}

export async function updateQuestion(questionId: string, updates: any) {
    await checkIsInstructor()
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('quiz_questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single()

    if (error) throw error
    return { success: true, question: data }
}

export async function deleteQuestion(questionId: string) {
    await checkIsInstructor()
    const supabase = createServiceClient()

    const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId)

    if (error) throw error
    return { success: true }
}
