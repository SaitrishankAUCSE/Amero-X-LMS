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
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role?: 'student' | 'instructor' | 'admin'
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                }
                Update: {
                    role?: 'student' | 'instructor' | 'admin'
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
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
                    instructor_id: string
                    category_id: string | null
                    level: 'beginner' | 'intermediate' | 'advanced' | null
                    language: string
                    is_published: boolean
                    created_at: string
                    updated_at: string
                }
            }
            lessons: {
                Row: {
                    id: string
                    course_id: string
                    title: string
                    description: string | null
                    video_url: string | null
                    duration: number | null
                    order_index: number
                    is_free: boolean
                    created_at: string
                    updated_at: string
                }
            }
            enrollments: {
                Row: {
                    id: string
                    user_id: string
                    course_id: string
                    enrolled_at: string
                    completed_at: string | null
                }
            }
            reviews: {
                Row: {
                    id: string
                    course_id: string
                    user_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                    updated_at: string
                }
            }
            wishlist: {
                Row: {
                    id: string
                    user_id: string
                    course_id: string
                    added_at: string
                }
            }
        }
    }
}
