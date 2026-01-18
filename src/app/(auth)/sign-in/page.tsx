'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, getCurrentUser } from '@/lib/auth'
import toast from 'react-hot-toast'
import { Github, Eye, EyeOff, LockKeyhole, Mail, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import OAuthButtons from '@/components/auth/oauth-buttons'

function SignInContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/courses'
    const message = searchParams.get('message')

    const [loading, setLoading] = useState(false)

    const [checkingAuth, setCheckingAuth] = useState(true)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    })
    const [showPassword, setShowPassword] = useState(false)

    // Load remembered email
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('remembered_email')
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }))
        }

        async function checkAuth() {
            try {
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
        setLoading(true)

        try {
            if (formData.rememberMe) {
                localStorage.setItem('remembered_email', formData.email)
            } else {
                localStorage.removeItem('remembered_email')
            }

            await signIn(formData.email, formData.password)
            toast.success('Welcome back!')

            // Redirect to courses or the page they were trying to access
            router.push(redirect)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }



    // Show loading state while checking authentication
    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 px-4">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-2xl border border-border">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
                    <p className="mt-2 text-muted-foreground">Sign in to continue learning</p>
                    {message && (
                        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
                            {message}
                        </div>
                    )}
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
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
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                className="w-4 h-4 rounded border-white/10 bg-black/20 text-primary focus:ring-primary/50 cursor-pointer"
                            />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                        </label>
                        <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
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
                                    <span>Authenticating...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <LockKeyhole className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>Sign In to Dashboard</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>


                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link href="/sign-up" className="text-primary hover:underline font-bold transition-colors">
                            Create one
                        </Link>
                    </div>
                </form>
            </div >
        </div >
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <SignInContent />
        </Suspense>
    )
}
