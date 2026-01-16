import { checkIsAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase'
import { CourseForm } from '@/components/admin/course-form'
import Navbar from '@/components/navbar'


export default async function CreateCoursePage() {
    // Ensure only admins can access
    await checkIsAdmin()

    const supabase = createServiceClient()
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="container mx-auto py-12 px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Upload New Course
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Share your knowledge with the Amero X community
                    </p>
                </div>

                <CourseForm categories={categories || []} />
            </div>
        </main>
    )
}
