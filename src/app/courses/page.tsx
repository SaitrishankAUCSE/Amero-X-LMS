'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import CourseCard from '@/components/course-card'
import { Search, SlidersHorizontal } from 'lucide-react'
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
        loadData()
    }, [])

    async function loadData() {
        const supabase = createBrowserClient()

        try {
            // Load categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .order('name')

            if (categoriesError) {
                console.error('Error loading categories:', categoriesError)
            } else if (categoriesData) {
                setCategories(categoriesData)
            }

            // Load published courses
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false })

            if (coursesError) {
                console.error('Error loading courses:', coursesError)
                setCourses([])
            } else if (coursesData && coursesData.length > 0) {
                // Get unique instructor IDs and category IDs
                const instructorIds = [...new Set(coursesData.map((c: any) => c.instructor_id).filter(Boolean))]
                const categoryIds = [...new Set(coursesData.map((c: any) => c.category_id).filter(Boolean))]

                // Fetch instructors
                const { data: instructorsData } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', instructorIds)

                // Fetch categories
                const { data: categoriesDataForCourses } = await supabase
                    .from('categories')
                    .select('id, name')
                    .in('id', categoryIds)

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
            setUser(user)

        } catch (error) {
            console.error('Unexpected error loading data:', error)
            setCourses([])
        }

        setLoading(false)
    }

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || course.category_id === selectedCategory
        const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
        return matchesSearch && matchesCategory && matchesLevel
    })

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

                                {/* Search */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Search Keywords</label>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                                        <input
                                            type="text"
                                            placeholder="e.g. React, Design..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-black/40 transition-all placeholder:text-muted-foreground/40"
                                            suppressHydrationWarning
                                        />
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Category</label>
                                    <div className="space-y-1.5">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${selectedCategory === 'all'
                                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                                : 'hover:bg-white/5 text-muted-foreground hover:text-white'}`}
                                            suppressHydrationWarning
                                        >
                                            All Categories
                                            {selectedCategory === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${selectedCategory === cat.id
                                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                                    : 'hover:bg-white/5 text-muted-foreground hover:text-white'}`}
                                                suppressHydrationWarning
                                            >
                                                {cat.name}
                                                {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Level Filter */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Difficulty Level</label>
                                    <div className="relative">
                                        <select
                                            value={selectedLevel}
                                            onChange={(e) => setSelectedLevel(e.target.value)}
                                            className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-black/40 transition-all cursor-pointer appearance-none text-foreground"
                                            suppressHydrationWarning
                                        >
                                            <option value="all">Any Level</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-muted-foreground opacity-50" />
                                        </div>
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
