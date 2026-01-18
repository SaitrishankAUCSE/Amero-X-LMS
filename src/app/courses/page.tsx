'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import CourseCard from '@/components/course-card'
import { useRouter } from 'next/navigation'
import PaymentModal from '@/components/payment-modal'

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedLevel, setSelectedLevel] = useState('all')
    const [categories, setCategories] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [selectedCourse, setSelectedCourse] = useState<any>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        let isMounted = true

        async function loadData() {
            try {
                const response = await fetch('/api/courses')
                if (!response.ok) {
                    throw new Error('Failed to fetch courses')
                }
                const data = await response.json()

                if (isMounted) {
                    setCourses(data.courses || [])
                    setCategories(data.categories || [])
                }

                // Get current user (still needs supabase client for auth state)
                const supabase = createBrowserClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (isMounted) {
                    setUser(user)
                }

            } catch (error: any) {
                if (isMounted) {
                    console.error('Error loading data:', error)
                    setCourses([])
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadData()

        return () => {
            isMounted = false
        }
    }, [])

    const filteredCourses = courses.filter(course => {
        const searchTermLower = searchTerm.toLowerCase()
        const matchesSearch =
            course.title.toLowerCase().includes(searchTermLower) ||
            course.description?.toLowerCase().includes(searchTermLower) ||
            course.instructor_name?.toLowerCase().includes(searchTermLower) ||
            course.category_name?.toLowerCase().includes(searchTermLower)

        const matchesCategory = selectedCategory === 'all' || course.category_id === selectedCategory
        const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel

        return matchesSearch && matchesCategory && matchesLevel
    })

    // Calculate category counts
    const categoryCounts = categories.reduce((acc: any, cat: any) => {
        const count = courses.filter(c => c.category_id === cat.id).length
        acc[cat.id] = count
        return acc
    }, {})
    const totalCount = courses.length

    const handleBuy = (course: any) => {
        setSelectedCourse(course)
        setIsPaymentModalOpen(true)
    }


    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <div className="flex-1 relative">
                <div className="relative py-24 px-4 overflow-hidden border-b border-white/5">
                    {/* Abstract Background Elements */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] -z-10" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

                    <div className="container mx-auto relative z-10 text-center">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-primary mb-4 animate-fade-in">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Explore Our Catalog
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                                Unlock Your Potential with <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700">Premium Education</span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
                                Access world-class courses taught by industry experts. Elevate your skills and advance your career with our comprehensive learning platform.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pb-20">
                    {/* Courses Grid */}
                    <div className="w-full">
                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-[400px] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                                ))}
                            </div>
                        ) : courses.length > 0 ? (
                            <>
                                <div className="flex justify-between items-end mb-6">
                                    <div className="text-muted-foreground">
                                        Showing <span className="text-foreground font-semibold">{courses.length}</span> courses
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {courses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            onBuy={handleBuy}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                <h3 className="text-xl font-semibold text-foreground mb-2">No courses available</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Check back soon for new courses!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />

            {selectedCourse && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    course={selectedCourse}
                    userId={user?.id || ''}
                    userEmail={user?.email || ''}
                    userName={user?.user_metadata?.full_name || 'Student'}
                />
            )}
        </div>
    )
}
