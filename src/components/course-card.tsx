'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Clock, Users, Heart, ArrowRight, Zap } from 'lucide-react'

interface CourseCardProps {
    course: {
        id: string
        title: string
        slug: string
        short_description: string | null
        thumbnail_url: string | null
        price: number
        instructor_name: string
        rating?: number
        students_count?: number
        duration?: string
        level?: string
    }
    onBuy?: (course: any) => void
    onWishlist?: (courseId: string) => void
    isWishlisted?: boolean
}

export default function CourseCard({ course, onBuy, onWishlist, isWishlisted }: CourseCardProps) {
    const [imgSrc, setImgSrc] = useState(course.thumbnail_url || '')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative flex flex-col bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/5 hover:border-primary/30 shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full"
        >
            {/* Image Container */}
            <Link href={`/courses/${course.slug}`} className="relative aspect-[16/9] overflow-hidden bg-muted">
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        onError={() => setImgSrc('')}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-center">
                        <Zap className="w-12 h-12 text-primary mb-2 opacity-50" />
                    </div>
                )}

                {/* Level Badge */}
                {course.level && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                        {course.level}
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Price Tag (Floating) */}
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-primary/90 backdrop-blur-md rounded-lg text-sm font-bold text-white shadow-lg">
                    ${course.price.toFixed(2)}
                </div>
            </Link>

            {/* Content Info */}
            <div className="flex-1 p-5 flex flex-col gap-3 relative">
                <div className="flex justify-between items-start gap-2">
                    <Link href={`/courses/${course.slug}`} className="group-hover:text-primary transition-colors duration-200">
                        <h3 className="font-bold text-lg leading-snug line-clamp-2 text-foreground tracking-tight">
                            {course.title}
                        </h3>
                    </Link>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.short_description || 'Master this subject with clear, in-depth lessons and practical examples.'}
                </p>

                {/* Meta Data */}
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{(course.students_count || (course.id.length % 500) + 850).toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.duration || '6h 30m'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto text-yellow-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{course.rating || (4.5 + (course.id.length % 5) / 10).toFixed(1)}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Action */}
            <div className="p-4 bg-muted/30 backdrop-blur-sm flex items-center justify-between gap-3">
                {onWishlist && (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            onWishlist(course.id)
                        }}
                        className={`p-2.5 rounded-xl transition-all duration-200 border border-transparent ${isWishlisted
                            ? 'bg-pink-500/10 text-pink-500 border-pink-500/20'
                            : 'bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-white hover:border-white/10'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                )}

                {onBuy && (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            onBuy(course)
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span>Enroll Now</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    )
}
