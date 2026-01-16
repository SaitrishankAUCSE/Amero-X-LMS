'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { signInWithOAuth } from '@/lib/auth'
import { Github } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OAuthButtons() {
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleOAuthSignIn = async (provider: 'google' | 'github') => {
        try {
            setIsLoading(provider)
            await signInWithOAuth(provider)
        } catch (error: any) {
            toast.error(error.message || `Failed to sign in with ${provider}`)
            setIsLoading(null)
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={!!isLoading}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {isLoading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                )}
                <span>Google</span>
            </button>

            <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={!!isLoading}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] text-white rounded-xl font-semibold hover:bg-[#2c3238] transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {isLoading === 'github' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Github className="w-5 h-5" />
                )}
                <span>GitHub</span>
            </button>
        </div>
    )
}
