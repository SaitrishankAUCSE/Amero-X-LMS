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
            const currentUser = await getCurrentUser()
            setUser(currentUser)
        } catch (error) {
            console.error('Error loading user:', error)
            // Do not set user to null here immediately if it's just a network glitch, 
            // but for auth check it's safer.
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
    ]

    return (
        <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Amero X</span>
                    </Link>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={() => toast.success('Language selector coming soon!')}
                            className="flex items-center gap-2 mr-4 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs font-semibold text-muted-foreground hover:text-white transition-all active:scale-95"
                        >
                            <Globe className="w-3.5 h-3.5 text-primary" />
                            <span>EN</span>
                        </button>

                        {!loading && !user && (
                            <div className="flex items-center gap-4 mr-2">
                                <Link
                                    href="/sign-in"
                                    className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95"
                                >
                                    Get Started Free
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
                                >
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.full_name || 'User'}
                                            className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-primary/20 p-0.5"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md border-2 border-primary/20">
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
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl transition-all duration-200 transform origin-top-right p-2 z-50">
                                            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Menu</p>
                                            </div>

                                            <div className="flex flex-col space-y-1">
                                                {navLinks.map((link) => (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <link.icon className="w-4 h-4 text-gray-400" />
                                                        {link.label}
                                                    </Link>
                                                ))}

                                                {mounted && (
                                                    <button
                                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left"
                                                    >
                                                        {theme === 'dark' ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
                                                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                                    </button>
                                                )}

                                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                                <Link
                                                    href={user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard'}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                                                    Dashboard
                                                </Link>

                                                {user.role === 'admin' && (
                                                    <Link
                                                        href="/admin/courses/create"
                                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Upload Course
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-left"
                                                >
                                                    <LogOut className="w-4 h-4" />
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
                                        className="flex items-center space-x-3 text-lg font-medium text-red-400 hover:text-red-300 transition-colors p-2 text-left w-full"
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
                                        className="flex justify-center items-center py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all"
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
