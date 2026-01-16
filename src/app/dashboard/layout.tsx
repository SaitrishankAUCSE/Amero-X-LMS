import Navbar from '@/components/navbar'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 bg-background">
                {children}
            </main>
        </div>
    )
}
