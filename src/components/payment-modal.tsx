'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'
import Image from 'next/image'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    course: {
        id: string
        title: string
        price: number
        thumbnail_url: string | null
    }
    userId: string
    userEmail: string
    userName: string
}

export default function PaymentModal({ isOpen, onClose, course, userId, userEmail, userName }: PaymentModalProps) {
    const [loading, setLoading] = useState(false)

    // Load Razorpay script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleStripePayment = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course.id,
                    userId,
                }),
            })

            let data;
            try {
                data = await response.json()
            } catch (e) {
                const text = await response.text()
                console.error('Server returned non-JSON:', text)
                throw new Error('Server error: ' + (response.statusText || 'Unknown error'))
            }

            if (!response.ok) throw new Error(data.error || 'Payment failed')

            // Redirect to Stripe Checkout
            window.location.href = data.url
        } catch (error: any) {
            console.error('Stripe error:', error)
            toast.error(error.message || 'Payment failed')
            setLoading(false)
        }
    }

    const handleRazorpayPayment = async () => {
        try {
            setLoading(true)
            const res = await loadRazorpay()

            if (!res) {
                toast.error('Razorpay SDK failed to load')
                setLoading(false)
                return
            }

            // Create Order
            const response = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course.id,
                    userId,
                }),
            })

            let data;
            try {
                data = await response.json()
            } catch (e) {
                const text = await response.text()
                console.error('Server returned non-JSON:', text)
                throw new Error('Server error: ' + (response.statusText || 'Unknown error'))
            }

            if (!response.ok) throw new Error(data.error || 'Payment creation failed')

            // Initialize Razorpay
            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'Amero X LMS',
                description: `Payment for ${course.title}`,
                order_id: data.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                courseId: course.id,
                                userId: userId
                            }),
                        })

                        const verifyData = await verifyRes.json()

                        if (verifyRes.ok) { // Check verifyRes.ok instead of verifyData.isOk
                            toast.success('Payment successful!')
                            window.location.href = '/dashboard/my-courses'
                        } else {
                            toast.error(verifyData.error || 'Payment verification failed')
                        }
                    } catch (err) {
                        toast.error('Payment verification failed')
                    }
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                },
                theme: {
                    color: '#c9a227', // Gold
                },
            }

            const paymentObject = new (window as any).Razorpay(options)
            paymentObject.open()
            setLoading(false)
        } catch (error: any) {
            console.error('Razorpay error:', error)
            toast.error(error.message || 'Payment failed')
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Header Image */}
                            <div className="relative h-48 bg-muted">
                                {course.thumbnail_url ? (
                                    <Image
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                        <span className="text-4xl font-bold text-primary/40">{course.title[0]}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl font-bold text-white line-clamp-2">{course.title}</h3>
                                    <p className="text-white/80 font-medium text-lg mt-1">${course.price.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {!userId ? (
                                    <div className="text-center py-6">
                                        <h4 className="text-lg font-bold mb-2">Sign in to Purchase</h4>
                                        <p className="text-muted-foreground mb-6">
                                            Please sign in or create an account to enroll in this course.
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <a
                                                href={`/sign-in?redirect=/courses`}
                                                className="px-6 py-2.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all"
                                            >
                                                Log In
                                            </a>
                                            <a
                                                href={`/sign-up?redirect=/courses`}
                                                className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
                                            >
                                                Sign Up
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                            Select Payment Method
                                        </h4>

                                        <div className="space-y-4">
                                            {/* Stripe Button */}
                                            <button
                                                onClick={handleStripePayment}
                                                disabled={loading}
                                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <CreditCard className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">Pay with Card</span>
                                                </div>
                                                <div className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">Stripe</div>
                                            </button>

                                            {/* Razorpay Button */}
                                            <button
                                                onClick={handleRazorpayPayment}
                                                disabled={loading}
                                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                                        <div className="text-amber-600 font-bold text-lg">₹</div>
                                                    </div>
                                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">Pay with Razorpay</span>
                                                </div>
                                                <div className="text-xs font-bold bg-amber-500/10 text-amber-600 px-2 py-1 rounded">UPI / NetBanking</div>
                                            </button>
                                        </div>

                                        {loading && (
                                            <div className="mt-6 flex items-center justify-center gap-2 text-primary animate-pulse">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm font-medium">Processing...</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
