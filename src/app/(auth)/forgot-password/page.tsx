'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const supabase = createBrowserClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) throw error
            setIsSubmitted(true)
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset link')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-card p-8 rounded-2xl border border-white/5 shadow-2xl"
            >
                {!isSubmitted ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold">Forgot Password?</h1>
                            <p className="text-muted-foreground mt-2">
                                No worries! Enter your email and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                            </button>

                            <Link
                                href="/sign-in"
                                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors py-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Sign In
                            </Link>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Check your email</h2>
                        <p className="text-muted-foreground mt-2 mb-8">
                            We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-primary font-bold hover:underline"
                        >
                            Didn't receive it? Try again
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
