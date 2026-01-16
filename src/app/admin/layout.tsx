'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    BarChart3,
    Settings,
    Ticket,
    Bell,
    Menu,
    X,
    LogOut,
    Globe
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const menuItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/courses', label: 'Courses', icon: BookOpen },
        { href: '/admin/users', label: 'User Management', icon: Users },
        { href: '/admin/analytics', label: 'Analytics & Revenue', icon: BarChart3 },
        { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
        { href: '/admin/cms', label: 'CMS & Pages', icon: FileText },
        { href: '/admin/settings', label: 'Settings & SEO', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0 shadow-lg`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">A</div>
                        <span>Amero Admin</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                                {item.label}
                            </Link>
                        )
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <Globe className="w-5 h-5 text-gray-400" />
                            View Site
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
