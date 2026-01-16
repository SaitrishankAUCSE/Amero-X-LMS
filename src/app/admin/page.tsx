import { createServiceClient } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/admin'
import { Users, DollarSign, BookOpen, TrendingUp, Activity } from 'lucide-react'

// Dashboard Statistic Card Component
function StatCard({ title, value, change, icon: Icon, color }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            {change && (
                <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-500 font-medium">{change}</span>
                    <span className="text-gray-400 ml-2">from last month</span>
                </div>
            )}
        </div>
    )
}

export default async function AdminDashboard() {
    await checkIsAdmin()
    const supabase = createServiceClient()

    // Fetch real counts
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true })

    // Revenue simulation (since we don't have transactions table yet)
    const revenue = 12580

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back, Administrator. Here is what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={userCount || 0}
                    change="+12%"
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${revenue.toLocaleString()}`}
                    change="+8.2%"
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Active Courses"
                    value={courseCount || 0}
                    change="+2"
                    icon={BookOpen}
                    color="bg-violet-500"
                />
                <StatCard
                    title="Engagement Rate"
                    value="64%"
                    change="+4.1%"
                    icon={Activity}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Registrations</h3>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
                    </div>
                    {/* Placeholder for list */}
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">New User Registered</p>
                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Platform Growth</h3>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-400 text-sm">Analytics Chart Integration Pending</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
