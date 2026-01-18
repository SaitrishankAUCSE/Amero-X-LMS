'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

export default function AuthModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [hasChecked, setHasChecked] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Don't show if already seen in this session
        if (sessionStorage.getItem('auth_modal_seen')) return

        const timer = setTimeout(async () => {
            const user = await getCurrentUser()
            if (!user) {
                setIsOpen(true)
                sessionStorage.setItem('auth_modal_seen', 'true')
            }
            setHasChecked(true)
        }, 5000) // Show after 5 seconds

        return () => clearTimeout(timer)
    }, [])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0f0f10] border border-yellow-500/20 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-purple-500/5" />

                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                Join the Future of Learning
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Unlock exclusive courses in Blockchain, AI, and Fintech. Join thousands of students transforming their careers today.
                            </p>

                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/sign-up"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Get Started for Free
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/sign-in"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-3.5 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 border border-white/10 transition-all"
                                >
                                    I already have an account
                                </Link>
                            </div>

                            <p className="mt-6 text-xs text-muted-foreground">
                                No credit card required for free courses.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
