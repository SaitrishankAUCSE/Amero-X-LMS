import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
    try {
        const supabase = createServiceClient()

        // 1. Get or Create Instructor
        let { data: instructor } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'instructor')
            .limit(1)
            .single()

        if (!instructor) {
            // Create user in auth.users first
            const email = `instructor_${Date.now()}@example.com`
            const { data: userData, error: userError } = await (supabase.auth as any).admin.createUser({
                email,
                password: 'Password123!',
                email_confirm: true,
                user_metadata: { full_name: 'StartUp Instructor', role: 'instructor' }
            })

            if (userError) throw userError

            const userId = userData.user.id

            // Create/Upsert profile using the REAL user id
            const { data: newInstructor, error: createError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    role: 'instructor',
                    full_name: 'StartUp Instructor',
                    bio: 'Placeholder instructor'
                })
                .select()
                .single()

            if (createError) throw createError
            instructor = newInstructor
        }

        // 2. Fetch all courses (old and new)
        const { data: allCourses } = await supabase.from('courses').select('id, title')

        if (!allCourses || allCourses.length === 0) {
            // If no courses at all, create some (reuse previous logic if needed, but for now assuming some might exist)
            // Or just let the existing logic below create new ones.
        }

        // ... [Existing category & course creation logic kept if needed, but focusing on simple lesson seeding for ALL courses] ...

        // Let's ensure we have categories first
        const categoriesData = [
            { name: 'AI & Machine Learning', slug: 'ai-ml', description: 'Explore artificial intelligence, neural networks, and machine learning models.' },
            { name: 'Cryptography', slug: 'cryptography', description: 'The science of secure communication and digital assets.' },
            { name: 'Smart Contracts', slug: 'smart-contracts', description: 'Learn to build decentralized logic on Ethereum and other blockchains.' },
            { name: 'Blockchain', slug: 'blockchain', description: 'Global ledger and decentralized systems.' }
        ]

        for (const cat of categoriesData) {
            await supabase.from('categories').upsert(cat, { onConflict: 'slug' })
        }

        // Create Default Courses if they don't exist
        const defaultCourses = [
            {
                title: 'Mastering Web3 Development',
                slug: 'master-web3',
                description: 'A comprehensive guide to building decentralized applications (dApps) using Solidity, Ethers.js, and Hardhat. Learn to build secure smart contracts and modern Web3 interfaces.',
                short_description: 'Build the future with decentralized apps and smart contracts.',
                price: 89.99,
                instructor_id: (instructor as any).id,
                level: 'intermediate',
                language: 'English',
                is_published: true,
                thumbnail_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800'
            },
            {
                title: 'AI & Neural Networks for Beginners',
                slug: 'ai-neural-networks',
                description: 'Explore the foundations of Artificial Intelligence. Understand neural networks, deep learning, and how to implement them using Python and PyTorch.',
                short_description: 'Demystifying AI and deep learning for modern developers.',
                price: 74.99,
                instructor_id: (instructor as any).id,
                level: 'beginner',
                language: 'English',
                is_published: true,
                thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
            },
            {
                title: 'Advanced Applied Cryptography',
                slug: 'advanced-crypto',
                description: 'Master the primitives of modern security. Learn about RSA, Elliptic Curve Cryptography, and Zero-Knowledge Proofs for privacy-preserving systems.',
                short_description: 'The science of secure communication and digital assets.',
                price: 99.99,
                instructor_id: (instructor as any).id,
                level: 'advanced',
                language: 'English',
                is_published: true,
                thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800'
            }
        ]

        for (const c of defaultCourses) {
            // Check if exists by slug
            const { data: existing } = await supabase.from('courses').select('id').eq('slug', c.slug).single()
            if (!existing) {
                await supabase.from('courses').insert(c)
            }
        }

        // RE-FETCH ALL COURSES to seed lessons
        const { data: coursesToSeed } = await supabase.from('courses').select('*')

        if (coursesToSeed) {
            for (const courseItem of coursesToSeed) {
                // Check if lessons exist
                const { count } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', courseItem.id)

                if (count === 0) {
                    const lessons = [
                        {
                            course_id: courseItem.id,
                            title: `Welcome to ${courseItem.title}`,
                            description: `Overview of the course content. [Download Syllabus](https://files.edgestore.dev/syllabus.pdf)`,
                            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            order_index: 1,
                            is_free: true
                        },
                        {
                            course_id: courseItem.id,
                            title: 'Chapter 1: Foundations',
                            description: 'Core concepts explained deeply. Includes source code.',
                            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            order_index: 2,
                            is_free: false
                        },
                        {
                            course_id: courseItem.id,
                            title: 'Chapter 2: Advanced Techniques',
                            description: 'Hands-on implementation of protocols.',
                            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                            order_index: 3,
                            is_free: false
                        }
                    ]
                    await supabase.from('lessons').insert(lessons)
                }
            }
        }

        return NextResponse.json({ success: true, message: "Seeded courses and lessons successfully" })
    } catch (error: any) {
        console.error('Seed error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

