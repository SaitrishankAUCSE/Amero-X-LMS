'use client'

import { useEffect, useState, use } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlayCircle, FileText, CheckCircle, Lock, Menu, X, ChevronLeft } from 'lucide-react'
import Navbar from '@/components/navbar'

export default function LearnPage({ params }: { params: Promise<{ courseId: string }> }) {
    // Unwrap params using React.use()
    const { courseId } = use(params)

    const router = useRouter()
    const [course, setCourse] = useState<any>(null)
    const [lessons, setLessons] = useState<any[]>([])
    const [activeLesson, setActiveLesson] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        const loadCourseContent = async () => {
            const supabase = createBrowserClient()

            // 1. Check Auth & Enrollment
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push(`/sign-in?redirect=/learn/${courseId}`)
                return
            }

            // check enrollment
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', courseId)
                .single()

            if (!enrollment) {
                // Check if it's the instructor
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

                // Fetch course to check instructor_id
                const { data: courseCheck } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()

                if (profile?.role !== 'admin' && courseCheck?.instructor_id !== user.id) {
                    router.push(`/courses`) // or buy page
                    return
                }
            }

            // 2. Fetch Course & Lessons
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single()

            if (courseError) {
                console.error("Error loading course:", courseError)
                return
            }
            setCourse(courseData)

            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('course_id', courseId)
                .order('order_index', { ascending: true })

            if (lessonsData) {
                setLessons(lessonsData)
                if (lessonsData.length > 0) {
                    setActiveLesson(lessonsData[0])
                }
            }

            setLoading(false)
        }

        loadCourseContent()
    }, [courseId, router])

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
                                onClick={() => setActiveLesson(lesson)}
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
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                            {activeLesson?.video_url ? (
                                activeLesson.video_url.includes('youtube') ? (
                                    <iframe
                                        src={activeLesson.video_url.replace('watch?v=', 'embed/')}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video src={activeLesson.video_url} controls className="w-full h-full" />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                                    <PlayCircle className="w-16 h-16 opacity-20" />
                                    <p>Select a lesson to start watching</p>
                                </div>
                            )}
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                {activeLesson?.title || 'Welcome to the Course'}
                            </h1>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                <p>{activeLesson?.description}</p>
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="pt-8 border-t border-border">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Resources</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group">
                                    <div className="p-2 bg-red-500/10 rounded-lg">
                                        <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">Lesson Slides.pdf</p>
                                        <p className="text-xs text-muted-foreground">2.4 MB</p>
                                    </div>
                                </a>
                                <a href="https://files.edgestore.dev/syllabus.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">Source Code.zip</p>
                                        <p className="text-xs text-muted-foreground">1.1 MB</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
