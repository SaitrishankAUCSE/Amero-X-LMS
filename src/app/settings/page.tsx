'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, signOut } from '@/lib/auth'
import Navbar from '@/components/navbar'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { User, Mail, Shield, Bell, LogOut, Loader2 } from 'lucide-react'

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function loadUser() {
            try {
                const userData = await getCurrentUser()
                if (!userData) {
                    router.push('/sign-in')
                    return
                }
                setUser(userData)
            } catch (error) {
                console.error('Failed to load user', error)
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [router])

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    const handleSave = () => {
        setSaving(true)
        // Simulate API call
        setTimeout(() => {
            setSaving(false)
            toast.success('Preferences saved successfully')
        }, 1000)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                        <p className="text-muted-foreground">Manage your account preferences and profile.</p>
                    </div>

                    <div className="grid gap-6">
                        {/* Profile Card */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                                    <p className="text-sm text-muted-foreground">Your personal account details</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Full Name</label>
                                    <input
                                        disabled
                                        value={user?.full_name || ''}
                                        className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Email Address</label>
                                    <input
                                        disabled
                                        value={user?.email || ''}
                                        className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Role</label>
                                    <input
                                        disabled
                                        value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                                        className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preferences Card */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-yellow-500/10 rounded-full">
                                    <Bell className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
                                    <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="space-y-0.5">
                                        <div className="font-medium text-foreground">Marketing Emails</div>
                                        <div className="text-sm text-muted-foreground">Receive updates about new courses and features</div>
                                    </div>
                                    <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="space-y-0.5">
                                        <div className="font-medium text-foreground">Security Alerts</div>
                                        <div className="text-sm text-muted-foreground">Get notified about sign-ins from new devices</div>
                                    </div>
                                    <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" defaultChecked disabled />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-red-600 mb-2">Account Actions</h2>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
