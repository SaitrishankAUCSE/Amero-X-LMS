'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import CourseCard from '@/components/course-card'
import { Search, SlidersHorizontal, X } from 'lucide-react'
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
            const supabase = createBrowserClient()

            try {
                // Load categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name')

                if (!isMounted) return

                if (categoriesError) {
                    const isAbort = categoriesError.message?.includes('AbortError') ||
                        categoriesError.message?.includes('signal is aborted') ||
                        categoriesError.details?.includes('AbortError');

                    if (!isAbort) {
                        console.error('Error loading categories:', JSON.stringify(categoriesError, null, 2))
                    }
                } else if (categoriesData) {
                    setCategories(categoriesData)
                }

                // Load published courses
                const { data: coursesData, error: coursesError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('is_published', true)
                    .order('created_at', { ascending: false })

                if (!isMounted) return

                if (coursesError) {
                    const isAbort = coursesError.message?.includes('AbortError') ||
                        coursesError.message?.includes('signal is aborted') ||
                        coursesError.details?.includes('AbortError');

                    if (!isAbort) {
                        console.error('Error loading courses (full):', coursesError)
                        console.error('Error details:', {
                            message: coursesError.message,
                            code: coursesError.code,
                            details: coursesError.details,
                            hint: coursesError.hint
                        })
                        setCourses([])
                    }
                } else if (coursesData && coursesData.length > 0) {
                    // Get unique instructor IDs and category IDs
                    const instructorIds = [...new Set(coursesData.map((c: any) => c.instructor_id).filter(Boolean))]
                    const categoryIds = [...new Set(coursesData.map((c: any) => c.category_id).filter(Boolean))]

                    // Fetch instructors
                    const { data: instructorsData } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', instructorIds)

                    // Fetch categories (supplemental lookup)
                    // We can reuse categoriesData if we want, but this logic guarantees we have the ones referenced by courses
                    const { data: categoriesDataForCourses } = await supabase
                        .from('categories')
                        .select('id, name')
                        .in('id', categoryIds)

                    if (!isMounted) return

                    // Create lookup maps
                    const instructorMap = new Map(instructorsData?.map((i: any) => [i.id, i.full_name]) || [])
                    const categoryMap = new Map(categoriesDataForCourses?.map((c: any) => [c.id, c.name]) || [])

                    // Format courses with instructor and category names
                    const formattedCourses = coursesData.map((course: any) => ({
                        ...course,
                        instructor_name: instructorMap.get(course.instructor_id) || 'Anonymous',
                        category_name: categoryMap.get(course.category_id) || 'Uncategorized'
                    }))
                    setCourses(formattedCourses)
                } else {
                    setCourses([])
                }

                // Get current user
                const { data: { user } } = await supabase.auth.getUser()
                if (isMounted) {
                    setUser(user)
                }

            } catch (error: any) {
                if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('signal is aborted')) {
                    // Request aborted, ignore
                    return
                }
                if (isMounted) {
                    console.error('Unexpected error loading data:', error)
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
        if (!user) {
            router.push(`/sign-in?redirect=/courses/${course.slug}`)
            return
        }
        setSelectedCourse(course)
        setIsPaymentModalOpen(true)
    }


    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <div className="flex-1 relative">
                <div className="relative py-24 px-4 overflow-hidden border-b border-white/5">
                    {/* Abstract Background Elements */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

                    <div className="container mx-auto relative z-10 text-center">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-blue-300 mb-4 animate-fade-in">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Explore Our Catalog
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                                Unlock Your Potential with <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Premium Education</span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
                                Access world-class courses taught by industry experts. Elevate your skills and advance your career with our comprehensive learning platform.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pb-20">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Glassmorphic Filters Sidebar */}
                        <aside className="lg:w-72 shrink-0">
                            <div className="sticky top-24 p-6 rounded-3xl border border-white/5 bg-card/30 backdrop-blur-xl shadow-xl space-y-8">
                                <div className="flex items-center gap-2 text-lg font-bold text-white border-b border-white/5 pb-4">
                                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                                    Filter Courses
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Search Keywords</label>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                                        <input
                                            type="text"
                                            placeholder="Search courses, mentors..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-primary/50 focus:bg-black/40 transition-all placeholder:text-muted-foreground/40"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-white transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                                        <span className="text-[10px] text-muted-foreground/60 px-2 py-0.5 bg-white/5 rounded-full">{totalCount} total</span>
                                    </div>
                                    <div className="space-y-1.5 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            suppressHydrationWarning
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${selectedCategory === 'all'
                                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                                : 'hover:bg-white/5 text-muted-foreground hover:text-white'}`}
                                        >
                                            <span className="truncate">All Categories</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-muted-foreground'}`}>{totalCount}</span>
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                suppressHydrationWarning
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${selectedCategory === cat.id
                                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                                    : 'hover:bg-white/5 text-muted-foreground hover:text-white'}`}
                                            >
                                                <span className="truncate">{cat.name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white/5 text-muted-foreground'}`}>
                                                    {categoryCounts[cat.id] || 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Level Filter */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Difficulty Level</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                                            <button
                                                key={level}
                                                suppressHydrationWarning
                                                onClick={() => setSelectedLevel(level)}
                                                className={`px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${selectedLevel === level
                                                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]'
                                                    : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/20 hover:text-white'
                                                    }`}
                                            >
                                                {level === 'all' ? 'Any' : level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Courses Grid */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-[400px] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                                    ))}
                                </div>
                            ) : filteredCourses.length > 0 ? (
                                <>
                                    <div className="flex justify-between items-end mb-6">
                                        <div className="text-muted-foreground">
                                            Found <span className="text-white font-semibold">{filteredCourses.length}</span> results
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredCourses.map((course, index) => (
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
                                    <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
                                    <p className="text-muted-foreground max-w-sm">
                                        Try adjusting your search or filters to find what you're looking for.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('')
                                            setSelectedCategory('all')
                                            setSelectedLevel('all')
                                        }}
                                        className="mt-6 text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {selectedCourse && user && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    course={selectedCourse}
                    userId={user.id}
                    userEmail={user.email}
                    userName={user.user_metadata?.full_name || 'Student'}
                />
            )}
        </div>
    )
}
