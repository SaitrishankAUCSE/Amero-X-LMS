'use client'
import Link from 'next/link'
import { Rocket, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'

export default function HeroSection() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getCurrentUser().then(setUser).finally(() => setLoading(false))
    }, [])

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 pb-32">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4 inline mr-2 text-yellow-500" />
                        The Future of Online Learning
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-6 text-foreground tracking-tight leading-[1.1]">
                        Global Hub for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">Web3 & AI</span> Mastery
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                        Join the next generation of builders. Access premium, industry-led courses in Web3, AI, and Blockchain.
                    </p>

                    {!loading && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Rocket className="w-5 h-5" />
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/sign-up"
                                        className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg shadow-primary/25 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        <Rocket className="w-5 h-5" />
                                        Get Started
                                    </Link>
                                    <Link
                                        href="/courses"
                                        className="btn-secondary text-lg px-8 py-3 rounded-xl hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        Browse Courses
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                    {loading && <div className="h-14 w-64 bg-white/5 animate-pulse rounded-xl mx-auto" />}
                </div>
            </div>
        </section>
    )
}
