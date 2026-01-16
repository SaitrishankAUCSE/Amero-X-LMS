import { createServiceClient } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/admin'
import { Search, Shield, Ban, MoreHorizontal } from 'lucide-react'

export default async function UserManagementPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    await checkIsAdmin()
    const supabase = createServiceClient()
    const { q } = await searchParams

    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

    // Simple search
    if (q) {
        query = query.ilike('email', `%${q}%`)
    }

    const { data: users, error } = await query

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-gray-500 text-sm">Manage student and instructor accounts.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">User</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Joined</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users?.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                                                {user.email?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{user.full_name || 'No Name'}</div>
                                                <div className="text-gray-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize
                                            ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
                                                user.role === 'instructor' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
