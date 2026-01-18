'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { BookOpen, Award, TrendingUp, Clock, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

// Animated counter hook
function useCountUp(end: number, duration: number = 1500, start: boolean = true) {
    const [count, setCount] = useState(0)
    const countRef = useRef(0)
    const startTimeRef = useRef<number | null>(null)

    useEffect(() => {
        if (!start || end === 0) {
            setCount(end)
            return
        }

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            countRef.current = Math.floor(eased * end)
            setCount(countRef.current)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [end, duration, start])

    return count
}

// Skeleton component
function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%] rounded ${className || ''}`}
            style={{ animation: 'shimmer 1.5s infinite' }} />
    )
}

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
    const [animateStats, setAnimateStats] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const currentUser = await getCurrentUser()
            if (!currentUser) {
                setLoading(false)
                return
            }
            setUser(currentUser)

            const supabase = createBrowserClient()

            const { data: enrollments, error } = await supabase
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

            if (error) throw error

            if (enrollments) {
                setRecentCourses(enrollments.map(e => e.courses))
                const completed = enrollments.filter(e => e.completed_at).length
                setStats({
                    enrolledCourses: enrollments.length,
                    completedCourses: completed,
                    certificatesEarned: completed,
                    hoursLearned: 0,
                })
            }
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message?.includes('aborted')) return
            console.error('Dashboard load error:', error)
        } finally {
            setLoading(false)
            setTimeout(() => setAnimateStats(true), 100)
        }
    }

    // Animated stat values
    const enrolledCount = useCountUp(stats.enrolledCourses, 1200, animateStats)
    const completedCount = useCountUp(stats.completedCourses, 1200, animateStats)
    const certificatesCount = useCountUp(stats.certificatesEarned, 1200, animateStats)
    const hoursCount = useCountUp(stats.hoursLearned, 1200, animateStats)

    const statCards = [
        { icon: BookOpen, label: 'Enrolled Courses', value: enrolledCount, color: 'text-primary', bgColor: 'bg-primary/10' },
        { icon: Award, label: 'Certificates', value: certificatesCount, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
        { icon: TrendingUp, label: 'Completed', value: completedCount, color: 'text-green-500', bgColor: 'bg-green-500/10' },
        { icon: Clock, label: 'Hours Learned', value: hoursCount, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    ]

    // Skeleton loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-48" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-12" />
                                </div>
                                <Skeleton className="h-12 w-12 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Courses Skeleton */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                                <Skeleton className="aspect-video w-full" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-2 w-full mt-3 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Header with Animation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    Welcome back, {user?.full_name || 'Student'}!
                    <span className="text-2xl">👋</span>
                </h1>
                <p className="text-muted-foreground mt-2">Continue your learning journey</p>
            </motion.div>

            {/* Stats Grid with Staggered Animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all cursor-default"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Courses */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Continue Learning</h2>
                    <Link href="/dashboard/my-courses" className="text-primary hover:underline flex items-center gap-1 group">
                        View All
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {recentCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                            >
                                <Link
                                    href={`/learn/${course.id}`}
                                    className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                                        {course.thumbnail_url && (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
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
                                            <motion.div
                                                className="bg-primary h-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: '0%' }}
                                                transition={{ duration: 1, delay: 0.8 }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Start Learning</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16 bg-card border border-border rounded-2xl"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Start Your Learning Journey</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Explore our expert-led courses in Web3, AI, and Blockchain to begin building your future.
                        </p>
                        <Link href="/courses" className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl">
                            <BookOpen className="w-5 h-5" />
                            Browse Courses
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}

