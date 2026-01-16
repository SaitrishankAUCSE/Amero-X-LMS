'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-lg">
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
                    <p className="text-muted-foreground text-lg">
                        An unexpected error occurred. Our team has been notified and is working on a fix.
                    </p>
                    <div className="flex gap-4 justify-center pt-4">
                        <button
                            onClick={() => reset()}
                            className="btn-primary px-8 py-3"
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="btn-secondary px-8 py-3"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
