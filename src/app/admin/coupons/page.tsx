import { createServiceClient } from '@/lib/supabase'
import { checkIsAdmin } from '@/lib/admin'
import Link from 'next/link'
import { Plus, Ticket, Trash, Calendar } from 'lucide-react'

export default async function CouponsPage() {
    await checkIsAdmin()
    const supabase = createServiceClient()

    const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

    if (error && error.code === '42P01') {
        // Table doesn't exist
        return (
            <div className="p-8 text-center">
                <h3 className="text-lg font-bold text-red-600">Database Setup Required</h3>
                <p className="text-gray-500 mt-2">The 'coupons' table is missing. Please run the migration script.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Control</h1>
                    <p className="text-gray-500 text-sm">Manage discount codes and promotions.</p>
                </div>
                <Link
                    href="/admin/coupons/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Create Coupon
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons?.map((coupon) => (
                    <div key={coupon.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-mono text-xl font-bold text-gray-900 dark:text-white tracking-wider">{coupon.code}</h3>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {coupon.is_active ? 'Active' : 'Expired'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {coupon.discount_percent ? `${coupon.discount_percent}% OFF` : `$${coupon.discount_amount} OFF`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Usage</span>
                                <span>{coupon.used_count} / {coupon.max_uses || '∞'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                <span className="flex items-center gap-1 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    Expires
                                </span>
                                <span className="text-xs">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {(!coupons || coupons.length === 0) && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-900 dark:text-white font-medium">No coupons active</h3>
                        <p className="text-gray-500 text-sm mb-4">Create a new discount code to boost sales.</p>
                        <Link
                            href="/admin/coupons/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg"
                        >
                            Create Coupon
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
