import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Singleton instance for browser client
let browserClient: ReturnType<typeof createSSRBrowserClient> | null = null

// Client-side Supabase client (for components)
export const createBrowserClient = () => {
    if (browserClient) return browserClient

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    browserClient = createSSRBrowserClient(supabaseUrl, supabaseAnonKey)

    return browserClient
}

// Server-side Supabase client (for API routes with service role)
export const createServiceClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// Database types
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'student' | 'instructor' | 'admin'
                    full_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    phone: string | null
                    country: string | null
                    timezone: string
                    language: string
                    email_notifications: boolean
                    marketing_emails: boolean
                    created_at: string
                    updated_at: string
                    last_login_at: string | null
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    icon: string | null
                    color: string
                    order_index: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
            }
            courses: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    description: string | null
                    short_description: string | null
                    thumbnail_url: string | null
                    preview_video_url: string | null
                    price: number
                    original_price: number | null
                    currency: string
                    instructor_id: string
                    category_id: string | null
                    level: 'beginner' | 'intermediate' | 'advanced' | null
                    language: string
                    duration_hours: number | null
                    requirements: string[] | null
                    learning_outcomes: string[] | null
                    tags: string[] | null
                    is_published: boolean
                    is_featured: boolean
                    published_at: string | null
                    total_students: number
                    total_lessons: number
                    average_rating: number
                    total_reviews: number
                    created_at: string
                    updated_at: string
                }
            }
            course_sections: {
                Row: {
                    id: string
                    course_id: string
                    title: string
                    description: string | null
                    order_index: number
                    created_at: string
                    updated_at: string
                }
            }
            lessons: {
                Row: {
                    id: string
                    course_id: string
                    section_id: string | null
                    title: string
                    description: string | null
                    content_type: 'video' | 'text' | 'pdf' | 'quiz' | 'assignment'
                    video_url: string | null
                    video_duration: number | null
                    text_content: string | null
                    pdf_url: string | null
                    downloadable_resources: Json | null
                    order_index: number
                    is_free: boolean
                    is_published: boolean
                    created_at: string
                    updated_at: string
                }
            }
            quizzes: {
                Row: {
                    id: string
                    course_id: string
                    lesson_id: string | null
                    title: string
                    description: string | null
                    passing_score: number
                    time_limit_minutes: number | null
                    max_attempts: number | null
                    randomize_questions: boolean
                    show_correct_answers: boolean
                    is_published: boolean
                    created_at: string
                    updated_at: string
                }
            }
            quiz_questions: {
                Row: {
                    id: string
                    quiz_id: string
                    question_text: string
                    question_type: 'multiple_choice' | 'true_false' | 'short_answer'
                    options: Json | null
                    correct_answer: string
                    explanation: string | null
                    points: number
                    order_index: number
                    created_at: string
                }
            }
            assignments: {
                Row: {
                    id: string
                    course_id: string
                    lesson_id: string | null
                    title: string
                    description: string | null
                    attachment_url: string | null
                    points: number
                    due_date: string | null
                    max_file_size_mb: number
                    is_published: boolean
                    created_at: string
                    updated_at: string
                }
            }
            assignment_submissions: {
                Row: {
                    id: string
                    assignment_id: string
                    user_id: string
                    file_url: string | null
                    submission_text: string | null
                    grade: number | null
                    feedback: string | null
                    submitted_at: string
                    graded_at: string | null
                }
            }
            enrollments: {
                Row: {
                    id: string
                    user_id: string
                    course_id: string
                    payment_id: string | null
                    progress_percentage: number
                    enrolled_at: string
                    started_at: string | null
                    completed_at: string | null
                    last_accessed_at: string | null
                }
            }
            payments: {
                Row: {
                    id: string
                    user_id: string
                    course_id: string | null
                    amount: number
                    currency: string
                    payment_method: 'stripe' | 'razorpay' | 'paypal'
                    stripe_payment_intent_id: string | null
                    razorpay_order_id: string | null
                    razorpay_payment_id: string | null
                    paypal_order_id: string | null
                    status: 'pending' | 'succeeded' | 'failed' | 'refunded'
                    metadata: Json | null
                    created_at: string
                    updated_at: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    course_id: string
                    user_id: string
                    rating: number
                    comment: string | null
                    is_verified_purchase: boolean
                    is_published: boolean
                    helpful_count: number
                    created_at: string
                    updated_at: string
                }
            }
        }
    }
}
