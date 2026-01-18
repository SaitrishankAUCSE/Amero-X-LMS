'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import PaymentModal from '@/components/payment-modal'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'
import { Star, Clock, Users, BookOpen, Award, CheckCircle, Play } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [course, setCourse] = useState<any>(null)
    const [lessons, setLessons] = useState<any[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [purchasing, setPurchasing] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        loadCourse()
    }, [params.slug])

    async function loadCourse() {
        const supabase = createBrowserClient()

        // Get course details
        const { data: courseData } = await supabase
            .from('courses')
            .select(`
        *,
        profiles:instructor_id (full_name, bio, avatar_url),
        categories (name)
      `)
            .eq('slug', params.slug)
            .eq('is_published', true)
            .single()

        if (!courseData) {
            router.push('/courses')
            return
        }

        setCourse(courseData)

        // Get lessons
        const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseData.id)
            .order('order_index')

        if (lessonsData) setLessons(lessonsData)

        // Get reviews
        const { data: reviewsData } = await supabase
            .from('reviews')
            .select(`
        *,
        profiles (full_name, avatar_url)
      `)
            .eq('course_id', courseData.id)
            .order('created_at', { ascending: false })
            .limit(5)

        if (reviewsData) setReviews(reviewsData)

        // Check enrollment
        const currentUser = await getCurrentUser()
        if (currentUser) {
            setUser(currentUser)
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('course_id', courseData.id)
                .single()

            setIsEnrolled(!!enrollment)
        }

        setLoading(false)
    }

    function handleEnroll() {
        setIsPaymentModalOpen(true)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!course) return null

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0)
    const hours = Math.floor(totalDuration / 3600)
    const minutes = Math.floor((totalDuration % 3600) / 60)

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-b border-border">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="mb-4">
                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                                    {course.categories?.name || 'Course'}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
                            <p className="text-xl text-muted-foreground mb-6">{course.short_description}</p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                {avgRating > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{avgRating.toFixed(1)}</span>
                                        <span className="text-muted-foreground">({reviews.length} reviews)</span>
                                    </div>
                                )}
                                {hours > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span>{hours}h {minutes}m</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    <span>{lessons.length} lessons</span>
                                </div>
                                {course.level && (
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5" />
                                        <span className="capitalize">{course.level}</span>
                                    </div>
                                )}
                            </div>

                            {/* Instructor */}
                            <div className="mt-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    {course.profiles?.avatar_url ? (
                                        <img src={course.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text font-semibold">{course.profiles?.full_name?.[0] || 'I'}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created by</p>
                                    <p className="font-semibold">{course.profiles?.full_name || 'Expert Instructor'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Enrollment Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
                                {course.preview_video_url && (
                                    <div className="aspect-video bg-gradient-to-br from-amber-900/50 to-amber-800/50 rounded-lg mb-4 flex items-center justify-center">
                                        <Play className="w-12 h-12 text-primary" />
                                    </div>
                                )}

                                <div className="text-4xl font-bold mb-1">${course.price.toFixed(2)}</div>
                                <p className="text-sm text-muted-foreground mb-6">One-time payment</p>

                                {isEnrolled ? (
                                    <button
                                        onClick={() => router.push(`/learn/${course.id}`)}
                                        className="w-full btn-primary mb-4"
                                    >
                                        Go to Course
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        disabled={purchasing}
                                        className="w-full btn-primary mb-4 disabled:opacity-50"
                                    >
                                        {purchasing ? 'Processing...' : 'Enroll Now'}
                                    </button>
                                )}

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                        <span>Lifetime access</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                        <span>Certificate of completion</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary" />
                                        <span>30-day money-back guarantee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                <p className="text-muted-foreground whitespace-pre-line">
                                    {course.description || 'No description available.'}
                                </p>
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
                            <div className="space-y-2">
                                {lessons.map((lesson, index) => (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-muted-foreground font-mono text-sm">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <div>
                                                <p className="font-medium">{lesson.title}</p>
                                                {lesson.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {lesson.is_free && (
                                                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">FREE</span>
                                            )}
                                            {lesson.duration && (
                                                <span className="text-sm text-muted-foreground">
                                                    {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="p-4 bg-card border border-border rounded-lg">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                                                    <span className="font-semibold">{review.profiles?.full_name?.[0] || 'U'}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="font-semibold">{review.profiles?.full_name || 'Anonymous'}</p>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                course={course}
                userId={user?.id || ''}
                userEmail={user?.email || ''}
                userName={user?.user_metadata?.full_name || 'Student'}
            />
        </div>
    )
}
