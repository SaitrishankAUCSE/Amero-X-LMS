'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Github, Eye, EyeOff, Check, AlertCircle, ShieldCheck } from 'lucide-react'
import { signUp, signInWithOAuth } from '@/lib/auth'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import OAuthButtons from '@/components/auth/oauth-buttons'

export default function SignUpPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [oauthLoading, setOauthLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    })
    const [showPassword, setShowPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: '',
        color: 'bg-gray-200'
    })

    const calculateStrength = (pass: string) => {
        let score = 0
        if (pass.length > 8) score++
        if (/[A-Z]/.test(pass)) score++
        if (/[0-9]/.test(pass)) score++
        if (/[^A-Za-z0-9]/.test(pass)) score++

        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
        const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']

        setPasswordStrength({
            score,
            feedback: labels[score],
            color: colors[score]
        })
    }

    useEffect(() => {
        calculateStrength(formData.password)
    }, [formData.password])

    // Check if user is already logged in
    useEffect(() => {
        async function checkAuth() {
            try {
                const { getCurrentUser } = await import('@/lib/auth') as any
                const user = await getCurrentUser()
                if (user) {
                    router.push('/courses')
                }
            } catch (error) {
                // Not logged in
            } finally {
                setCheckingAuth(false)
            }
        }
        checkAuth()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const password = formData.password.trim()
        const confirmPassword = formData.confirmPassword.trim()
        const email = formData.email.trim()
        const fullName = formData.fullName.trim()

        if (password !== confirmPassword) {
            toast.error('Passwords do not match!')
            return
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters!')
            return
        }

        setLoading(true)

        try {
            // 1. Check if email exists
            const checkRes = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (checkRes.ok) {
                const checkData = await checkRes.json()
                if (checkData.exists) {
                    toast.error('This email is already registered. Please login.')
                    setLoading(false)
                    return
                }
            }

            // 2. Proceed with Signup
            await signUp(email, password, fullName)
            toast.success('Account created! Please check your email to verify.')
            router.push('/sign-in?message=Check your email to verify your account')
        } catch (error: any) {
            console.error('Signup error:', error)
            if (error.message?.includes('already registered') || error.message?.includes('User already exists')) {
                toast.error('Account already exists! Please log in instead.')
            } else {
                toast.error(error.message || 'Failed to create account')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleOAuth = async (provider: 'google' | 'github') => {
        setOauthLoading(true)
        try {
            await signInWithOAuth(provider)
        } catch (error: any) {
            toast.error(`Failed to sign in with ${provider}`)
            setOauthLoading(false)
        }
    }

    if (checkingAuth) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 px-4">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-2xl border border-border">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
                    <p className="mt-2 text-muted-foreground">Join Amero X and start learning</p>
                </div>

                <div className="mt-8 space-y-4">
                    <OAuthButtons />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                required
                                className="input-field"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

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
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="input-field pr-12 focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Strength Meter */}
                            <div className="mt-3 space-y-2">
                                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider mb-1">
                                    <span className="text-muted-foreground">Strength: {passwordStrength.feedback}</span>
                                    <span className={formData.password.length >= 8 ? "text-green-500" : "text-muted-foreground"}>
                                        {formData.password.length}/8 chars
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-full flex-1 transition-all duration-500 ${i < passwordStrength.score ? passwordStrength.color : 'bg-white/5'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={`input-field transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 ring-red-500/20' : ''}`}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                {formData.confirmPassword && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {formData.password === formData.confirmPassword ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-white/5">
                        <input
                            id="terms"
                            type="checkbox"
                            required
                            checked={formData.acceptTerms}
                            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                            className="mt-1 w-4 h-4 rounded border-white/10 bg-black/20 text-primary focus:ring-primary/50"
                        />
                        <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                            I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. I understand my data will be securely stored.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.acceptTerms || passwordStrength.score < 2}
                        className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Securing Account...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>Create Professional Account</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    <div className="text-center text-sm pt-2">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/sign-in" className="text-primary hover:underline font-bold transition-colors">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
