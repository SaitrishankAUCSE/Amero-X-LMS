'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { ShieldCheck, Loader2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createBrowserClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error

            toast.success('Password updated successfully!')
            router.push('/sign-in')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-card p-8 rounded-2xl border border-white/5 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter your new secure password below to regain access.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
