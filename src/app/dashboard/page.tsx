'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react'

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState({
        enrolledCourses: 0,
        completedCourses: 0,
        certificatesEarned: 0,
        hoursLearned: 0,
    })
    const [recentCourses, setRecentCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        try {
            const currentUser = await getCurrentUser()
            if (!currentUser) {
                router.push('/sign-in')
                return
            }
            setUser(currentUser)

            const supabase = createBrowserClient()

            // Get enrolled courses
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select(`
          *,
          courses (
            id,
            title,
            slug,
            thumbnail_url,
            profiles:instructor_id (full_name)
          )
        `)
                .eq('user_id', currentUser.id)
                .order('enrolled_at', { ascending: false })
                .limit(4)

            if (enrollments) {
                setRecentCourses(enrollments.map(e => e.courses))

                const completed = enrollments.filter(e => e.completed_at).length
                setStats({
                    enrolledCourses: enrollments.length,
                    completedCourses: completed,
                    certificatesEarned: completed,
                    hoursLearned: 0,
                })
            } else {
                setStats({
                    enrolledCourses: 0,
                    completedCourses: 0,
                    certificatesEarned: 0,
                    hoursLearned: 0,
                })
            }
        } catch (error) {
            console.error('Dashboard load error:', error)
            setStats({
                enrolledCourses: 0,
                completedCourses: 0,
                certificatesEarned: 0,
                hoursLearned: 0,
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const statCards = [
        { icon: BookOpen, label: 'Enrolled Courses', value: stats.enrolledCourses, color: 'text-primary' },
        { icon: Award, label: 'Certificates', value: stats.certificatesEarned, color: 'text-yellow-500' },
        { icon: TrendingUp, label: 'Completed', value: stats.completedCourses, color: 'text-green-500' },
        { icon: Clock, label: 'Hours Learned', value: stats.hoursLearned, color: 'text-blue-500' },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {user?.full_name || 'Student'}! 👋</h1>
                <p className="text-muted-foreground mt-2">Continue your learning journey</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Courses */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Continue Learning</h2>
                    <Link href="/dashboard/my-courses" className="text-primary hover:underline">
                        View All
                    </Link>
                </div>

                {recentCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentCourses.map(course => (
                            <Link
                                key={course.id}
                                href={`/learn/${course.id}`}
                                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
                            >
                                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                                    {course.thumbnail_url && (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {course.profiles?.full_name || 'Instructor'}
                                    </p>
                                    <div className="mt-3 bg-secondary rounded-full h-2 overflow-hidden">
                                        <div className="bg-primary h-full w-0" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Start Learning</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-card border border-border rounded-xl">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet</p>
                        <Link href="/courses" className="btn-primary">
                            Browse Courses
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
