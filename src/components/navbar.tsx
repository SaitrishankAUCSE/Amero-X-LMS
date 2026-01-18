'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getCurrentUser, signOut } from '@/lib/auth'
import { createBrowserClient } from '@/lib/supabase'
import { useTheme } from 'next-themes'

import toast from 'react-hot-toast'
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, X, Rocket, Plus, Sun, Moon, Globe } from 'lucide-react'


export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        setMounted(true)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Initial load and Real-time auth listener
    useEffect(() => {
        const supabase = createBrowserClient()

        // Immediate check
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Optimization: Use session user directly if possible to avoid extra fetch, 
                // but we need profile data (role/avatar) which isn't always in session.user.metadata fully sync.
                await checkUser()
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setLoading(false)
                router.refresh() // Force refresh to update server components/middleware state if needed
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    async function checkUser() {
        try {
            const result = await getCurrentUser()
            setUser(result)
        } catch (error) {
            console.error('Error loading user:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    async function handleSignOut() {
        try {
            await signOut()
            toast.success('Signed out successfully')
            router.push('/')
            router.refresh()
        } catch (error) {
            toast.error('Failed to sign out')
        }
    }

    const navLinks = [
        { href: '/courses', label: 'Explore', icon: BookOpen },
        { href: '/about', label: 'About', icon: GraduationCap },
        { href: '/contact', label: 'Contact', icon: Globe },
    ]

    return (
        <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-900/20 group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Amero X</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/5 ${pathname === link.href ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => toast.success('Language selector coming soon!')}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs font-semibold text-muted-foreground hover:text-white transition-all active:scale-95"
                            suppressHydrationWarning
                        >
                            <Globe className="w-3.5 h-3.5 text-primary" />
                            <span>EN</span>
                        </button>

                        {!user && (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/sign-in"
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {!loading && user && (
                            <Link
                                href="/dashboard"
                                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all mr-2"
                            >
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                My Dashboard
                            </Link>
                        )}

                        {loading ? (
                            <div className="w-24 h-10 bg-white/5 animate-pulse rounded-xl" />
                        ) : user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors focus:outline-none"
                                    suppressHydrationWarning
                                >
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.full_name || 'User'}
                                            className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-primary/20 p-0.5"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-primary/20">
                                            {user?.email?.[0]?.toUpperCase() || <Menu className="w-4 h-4" />}
                                        </div>
                                    )}
                                    <div className="hidden lg:block text-left mr-2">
                                        <p className="text-xs font-bold text-white line-clamp-1">{user?.full_name || 'My Account'}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{user?.role || 'Student'}</p>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-3 w-72 bg-[#1a1b1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                                            {/* User Header */}
                                            <div className="p-4 bg-white/5 border-b border-white/10">
                                                <p className="text-sm font-bold text-white truncate">{user?.full_name || 'My Account'}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                            </div>

                                            <div className="p-2 space-y-1">
                                                {/* Learning Section */}
                                                <div className="px-3 py-2">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Learning</p>
                                                </div>
                                                <Link
                                                    href="/dashboard/my-courses"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                                        <BookOpen className="w-4 h-4" />
                                                    </div>
                                                    My Learning
                                                </Link>
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                                        <LayoutDashboard className="w-4 h-4" />
                                                    </div>
                                                    Dashboard
                                                </Link>

                                                {/* Account Section */}
                                                <div className="px-3 py-2 mt-2">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account</p>
                                                </div>
                                                <Link
                                                    href="/settings"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                                        <Sun className="w-4 h-4" />
                                                    </div>
                                                    Settings & Profile
                                                </Link>

                                                {/* Support Section */}
                                                <div className="px-3 py-2 mt-2">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Support</p>
                                                </div>
                                                <Link
                                                    href="/about"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                                        <GraduationCap className="w-4 h-4" />
                                                    </div>
                                                    About Us
                                                </Link>
                                                <Link
                                                    href="/contact"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-all group"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                    Contact Support
                                                </Link>

                                                {/* Auth Section */}
                                                <div className="h-px bg-white/10 my-2 mx-2" />
                                                <button
                                                    onClick={() => {
                                                        handleSignOut();
                                                        setUserMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-500/10 rounded-xl transition-all"
                                                >
                                                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
                                                        <LogOut className="w-4 h-4" />
                                                    </div>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-muted-foreground hover:text-white"
                        suppressHydrationWarning
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-6 border-t border-white/5 bg-background absolute left-0 right-0 px-4 shadow-xl">
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-3 text-lg font-medium text-muted-foreground hover:text-white transition-colors p-2"
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}

                            <div className="h-px bg-white/5 my-2" />

                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-3 text-lg font-medium text-muted-foreground hover:text-white transition-colors p-2"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut()
                                            setMobileMenuOpen(false)
                                        }}
                                        className="flex items-center space-x-3 text-lg font-medium text-amber-700 hover:text-amber-600 transition-colors p-2 text-left w-full"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <Link
                                        href="/sign-in"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex justify-center items-center py-3 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 font-medium transition-all"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/sign-up"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex justify-center items-center py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
