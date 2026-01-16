'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { Play, Clock, CheckCircle } from 'lucide-react'

export default function MyCoursesPage() {
    const router = useRouter()
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'inprogress' | 'completed'>('all')

    useEffect(() => {
        loadCourses()
    }, [])

    async function loadCourses() {
        try {
            const currentUser = await getCurrentUser()
            if (!currentUser) {
                router.push('/sign-in')
                return
            }

            const supabase = createBrowserClient()

            const { data: enrollments } = await supabase
                .from('enrollments')
                .select(`
          *,
          courses (
            id,
            title,
            slug,
            thumbnail_url,
            description,
            profiles:instructor_id (full_name)
          )
        `)
                .eq('user_id', currentUser.id)
                .order('enrolled_at', { ascending: false })

            if (enrollments) {
                setCourses(enrollments)
            }
        } catch (error) {
            console.error('Load courses error:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCourses = courses.filter(enrollment => {
        if (filter === 'completed') return enrollment.completed_at
        if (filter === 'inprogress') return !enrollment.completed_at
        return true
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">My Courses</h1>

                {/* Filter Tabs */}
                <div className="inline-flex bg-card border border-border rounded-lg p-1">
                    {[
                        { key: 'all', label: 'All Courses' },
                        { key: 'inprogress', label: 'In Progress' },
                        { key: 'completed', label: 'Completed' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as any)}
                            className={`px-4 py-2 rounded-md transition-colors ${filter === tab.key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(enrollment => {
                        const course = enrollment.courses
                        const progress = Math.floor(Math.random() * 100) // Mock progress

                        return (
                            <div key={enrollment.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all">
                                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                                    {course.thumbnail_url && (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/learn/${course.id}`}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Play className="w-5 h-5" />
                                            Continue Learning
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {course.profiles?.full_name || 'Instructor'}
                                    </p>

                                    {/* Progress */}
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-2 text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-primary h-full transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {enrollment.completed_at && (
                                        <div className="mt-4 flex items-center gap-2 text-green-500">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Completed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                    <p className="text-muted-foreground mb-4">No courses found</p>
                    <Link href="/courses" className="btn-primary">
                        Browse Courses
                    </Link>
                </div>
            )}
        </div>
    )
}
