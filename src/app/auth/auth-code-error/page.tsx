'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
                <p className="text-gray-600 mb-8">
                    There was a problem verifying your login. This could be due to an expired link or a configuration issue.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/sign-in"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>

                    <div className="pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            If this persists, please ensure social login is enabled in your dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
