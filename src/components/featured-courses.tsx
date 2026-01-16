'use client'

import { useState, useEffect } from 'react'
import CourseCard from './course-card'
import PaymentModal from './payment-modal'
import { getCurrentUser } from '@/lib/auth'

interface FeaturedCoursesProps {
    courses: any[]
}

export default function FeaturedCourses({ courses }: FeaturedCoursesProps) {
    const [user, setUser] = useState<any>(null)
    const [selectedCourse, setSelectedCourse] = useState<any>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

    useEffect(() => {
        getCurrentUser().then(setUser)
    }, [])

    const handleBuy = (course: any) => {
        if (!user) {
            window.location.href = `/sign-in?redirect=/courses/${course.slug}`
            return
        }
        setSelectedCourse(course)
        setIsPaymentModalOpen(true)
    }

    return (
        <>
            <div className="grid md:grid-cols-3 gap-8">
                {courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        onBuy={handleBuy}
                    />
                ))}
            </div>

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
        </>
    )
}
