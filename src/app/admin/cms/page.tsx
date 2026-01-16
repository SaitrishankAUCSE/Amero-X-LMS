import { createServiceClient } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/admin'
import Link from 'next/link'
import { Plus, FileText, Globe, Pencil, Trash } from 'lucide-react'

export default async function CMSPage() {
    await checkIsAdmin()
    const supabase = createServiceClient()

    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

    if (error && error.code === '42P01') {
        return (
            <div className="p-8 text-center">
                <h3 className="text-lg font-bold text-red-600">Database Setup Required</h3>
                <p className="text-gray-500 mt-2">The 'posts' table is missing. Please run the migration script.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CMS & Content</h1>
                    <p className="text-gray-500 text-sm">Manage blog posts, pages, and announcements.</p>
                </div>
                <Link
                    href="/admin/cms/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Post
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {posts?.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{post.title}</div>
                                    <div className="text-xs text-gray-500">/{post.slug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                                        {post.type === 'page' ? <Globe className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                        {post.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${post.is_published
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'}`}>
                                        {post.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!posts || posts.length === 0) && (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <h3 className="text-gray-900 dark:text-white font-medium">No content yet</h3>
                        <p className="text-gray-500 text-sm mb-4">Start writing your first blog post or page.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
