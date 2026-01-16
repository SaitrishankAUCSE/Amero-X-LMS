'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const sessionId = searchParams.get('session_id')
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        if (countdown === 0) {
            router.push('/dashboard/my-courses')
        }
    }, [countdown, router])

    useEffect(() => {
        if (sessionId) {
            fetch('/api/checkout/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            }).catch(err => console.error("Verification failed", err))
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 0) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [sessionId])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 px-4">
            <div className="max-w-md w-full text-center space-y-8 bg-card p-8 rounded-2xl shadow-2xl border border-border">
                <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-primary" />
                </div>

                <div>
                    <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                    <p className="text-muted-foreground">
                        Your enrollment has been confirmed. You now have full access to the course.
                    </p>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm">
                        Redirecting to your courses in <span className="font-bold text-primary">{countdown}</span> seconds...
                    </p>
                </div>

                <div className="space-y-3">
                    <Link href="/dashboard/my-courses" className="block w-full btn-primary">
                        Go to My Courses
                    </Link>
                    <Link href="/courses" className="block w-full btn-secondary">
                        Browse More Courses
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                </div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}
