'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { MailCheck, Loader2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const router = useRouter()
    const supabase = createBrowserClient()

    useEffect(() => {
        const handleCallback = async () => {
            const user = await getCurrentUser()

            if (!user) {
                setStatus('error')
                toast.error('Authentication failed')
                return
            }

            setStatus('success')
            toast.success('Successfully authenticated!')
            router.push('/dashboard')
        }

        handleCallback()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
            <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-white/5 shadow-2xl text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <h1 className="text-xl font-bold">Verifying your account...</h1>
                        <p className="text-muted-foreground mt-2">This will only take a moment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <MailCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold">Account Verified!</h1>
                        <p className="text-muted-foreground mt-2">Redirecting you to your dashboard...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold">Verification Failed</h1>
                        <p className="text-muted-foreground mt-2">The link might be expired or invalid.</p>
                        <button
                            onClick={() => router.push('/sign-in')}
                            className="mt-6 btn-primary px-6 py-2 rounded-xl"
                        >
                            Back to Sign In
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
