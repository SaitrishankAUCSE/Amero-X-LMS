'use client'

import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import toast from 'react-hot-toast'
import { Rocket, Bell } from 'lucide-react'

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />

                <div className="text-center space-y-8 max-w-2xl animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold text-xs uppercase tracking-widest">
                        <Rocket className="w-4 h-4" />
                        Under Construction
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                        Something Big is <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700">Coming Soon</span>
                    </h1>

                    <p className="text-xl text-muted-foreground/80 leading-relaxed max-w-lg mx-auto">
                        We are building a world-class community experience for the next generation of builders. Stay tuned for the launch!
                    </p>

                    <div className="pt-4">
                        <button
                            onClick={() => toast.success("Awesome! We'll notify you as soon as we're live.", {
                                icon: '🔔',
                                style: {
                                    borderRadius: '12px',
                                    background: '#1a1b1e',
                                    color: '#fff',
                                    border: '1px solid #2c2e33'
                                }
                            })}
                            className="btn-primary px-10 py-4 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                        >
                            <Bell className="w-5 h-5" />
                            Notify Me When Ready
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
