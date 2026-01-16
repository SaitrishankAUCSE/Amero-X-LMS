'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/auth'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await resetPassword(email)
            setSubmitted(true)
            toast.success('Reset link sent to your email')
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset link')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 px-4">
                <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-2xl border border-border text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Check your email</h2>
                    <p className="text-muted-foreground">
                        We have sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
                    </p>
                    <div className="pt-4">
                        <Link
                            href="/sign-in"
                            className="inline-flex items-center text-sm font-medium text-primary hover:underline gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 px-4">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-2xl border border-border">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
                    <p className="mt-2 text-muted-foreground">Enter your email to reset your password</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
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
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/sign-in"
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
