'use client'

import { useEffect, useState, use, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlayCircle, FileText, CheckCircle, Lock, Menu, X, ChevronLeft, Bookmark, Clock } from 'lucide-react'
import Navbar from '@/components/navbar'
import { LessonVideoPlayer } from '@/components/video/lesson-player'
import { getLessonProgress } from '@/app/actions/progress-actions'
import { LessonNotes } from '@/components/video/lesson-notes'
import { getCurrentUser } from '@/lib/auth'

export default function LearnPage({ params }: { params: Promise<{ courseId: string }> }) {
    // Unwrap params using React.use()
    const { courseId } = use(params)

    const router = useRouter()
    const [course, setCourse] = useState<any>(null)
    const [lessons, setLessons] = useState<any[]>([])
    const [activeLesson, setActiveLesson] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [progress, setProgress] = useState<any>(null)
    const [currentTime, setCurrentTime] = useState(0)
    const playerRef = useRef<any>(null)

    useEffect(() => {
        const loadCourseContent = async () => {
            const supabase = createBrowserClient()

            // 1. Check Auth & Enrollment
            const user = await getCurrentUser()
            if (!user) {
                router.push(`/sign-in?redirect=/learn/${courseId}`)
                return
            }

            // Check enrollment
            // We still use supabase client for this because we need to check the CURRENT user's enrollment
            // This might fail if RLS blocks reading your own enrollments, but usually that's allowed.
            // If it fails, we might need an API route for "check-my-enrollment" too.
            // Let's assume enrollment check works for now.
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', courseId)
                .single()

            if (!enrollment) {
                // Check if it's the instructor
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

                // For course check we can use the API data later, but need immediate check here
                // We'll trust the API fetch below to get course data for instructor check if needed
                // Or just rely on enrollment.
                // Let's defer strict "instructor check" to the API fetch logic if possible, 
                // but simpler: if no enrollment, and locally we can't confirm admin, redirect.
                // BUT, to be safe against RLS on 'courses', we'll fetch course data via API first.
            }

            // 2. Fetch Course & Lessons via API (Bypassing RLS)
            try {
                const response = await fetch(`/api/learn/${courseId}`)
                if (!response.ok) throw new Error('Failed to load course content')

                const data = await response.json()
                setCourse(data.course)
                setLessons(data.lessons || [])

                // Delayed instructor check if not enrolled
                if (!enrollment) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
                    const isInstructor = data.course.instructor_id === user.id
                    const isAdmin = profile?.role === 'admin'

                    if (!isInstructor && !isAdmin) {
                        router.push(`/courses/${data.course.slug || ''}`) // Redirect to course detail/buy page
                        return
                    }
                }

                if (data.lessons && data.lessons.length > 0) {
                    const firstLesson = data.lessons[0]
                    setActiveLesson(firstLesson)

                    // Fetch progress for first lesson
                    const progressData = await getLessonProgress(user.id, firstLesson.id)
                    setProgress(progressData)
                }

            } catch (err) {
                console.error("Error loading course API:", err)
            }

            setUser(user)
            setLoading(false)
        }

        loadCourseContent()
    }, [courseId, router])

    const handleLessonChange = async (lesson: any) => {
        setLoading(true) // Show subtle loading if needed
        setActiveLesson(lesson)
        if (user) {
            const progressData = await getLessonProgress(user.id, lesson.id)
            setProgress(progressData)
        }
        setLoading(false)
    }

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading content...</div>
    }

    if (!course) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white">Course not found</div>
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <div className="flex-1 flex pt-16 relative">
                {/* Sidebar - Desktop */}
                <aside className={`hidden md:flex flex-col w-80 bg-card border-r border-border fixed h-[calc(100vh-4rem)] z-20 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-80'}`}>
                    <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                        <h2 className="font-bold text-foreground truncate w-60">{course.title}</h2>
                        <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded">
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {lessons.map((lesson, idx) => (
                            <button
                                key={lesson.id}
                                onClick={() => handleLessonChange(lesson)}
                                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all flex gap-3 ${activeLesson?.id === lesson.id
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <div className="mt-0.5 shrink-0">
                                    {activeLesson?.id === lesson.id ? (
                                        <PlayCircle className="w-4 h-4 fill-primary text-primary" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[10px]">
                                            {idx + 1}
                                        </div>
                                    )}
                                </div>
                                <span className="line-clamp-2">{lesson.title}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 transition-all duration-300 p-6 md:p-10 ${sidebarOpen ? 'md:ml-80' : 'md:ml-0'}`}>
                    {/* Toggle Sidebar Button (when closed) */}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="hidden md:flex fixed left-4 top-24 z-30 p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-accent"
                        >
                            <Menu className="w-5 h-5 text-foreground" />
                        </button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden mb-6">
                        <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Menu className="w-5 h-5" />
                            <span>Course Menu</span>
                        </button>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Video Player Area */}
                        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl relative group border border-white/5">
                            {activeLesson && user ? (
                                activeLesson.content_type === 'video' ? (
                                    <LessonVideoPlayer
                                        key={activeLesson.id}
                                        src={activeLesson.video_url}
                                        courseId={courseId}
                                        lessonId={activeLesson.id}
                                        userId={user.id}
                                        initialProgress={progress?.video_progress_seconds || 0}
                                        onProgress={(seconds) => setCurrentTime(seconds)}
                                        onReady={(player) => playerRef.current = player}
                                        onComplete={() => {
                                            // Handle next lesson
                                        }}
                                    />
                                ) : (
                                    <div className="aspect-video flex items-center justify-center bg-gray-900 text-white p-12 text-center">
                                        <div>
                                            <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
                                            <h3 className="text-xl font-bold mb-2">Text Content</h3>
                                            <p className="text-muted-foreground">{activeLesson.title}</p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="aspect-video w-full h-full flex items-center justify-center text-muted-foreground flex-col gap-4 bg-gray-900">
                                    <PlayCircle className="w-16 h-16 opacity-20" />
                                    <p>Select a lesson to start watching</p>
                                </div>
                            )}
                        </div>

                        {/* Title & Description & Notes */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                        {activeLesson?.title || 'Welcome to the Course'}
                                    </h1>
                                    <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                        <p>{activeLesson?.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                {activeLesson && user && (
                                    <LessonNotes
                                        userId={user.id}
                                        courseId={courseId}
                                        lessonId={activeLesson.id}
                                        currentTimestamp={currentTime}
                                        onJumpToTime={(seconds) => {
                                            if (playerRef.current) {
                                                playerRef.current.currentTime(seconds)
                                                playerRef.current.play()
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="pt-8 border-t border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Lesson Resources</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {activeLesson?.description?.match(/\[([^\]]+)\]\(([^)]+\.pdf)\)/g)?.map((match: string, i: number) => {
                                    const [, title, url] = match.match(/\[([^\]]+)\]\(([^)]+\.pdf)\)/) || [];
                                    return (
                                        <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
                                        >
                                            <div className="p-2 bg-red-500/10 rounded-lg">
                                                <FileText className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{title}</p>
                                                <p className="text-xs text-muted-foreground">PDF Document</p>
                                            </div>
                                        </a>
                                    );
                                }) || (
                                        <div className="col-span-2 p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                                <FileText className="w-6 h-6 opacity-20" />
                                            </div>
                                            <p>No specific resources attached to this lesson.</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
