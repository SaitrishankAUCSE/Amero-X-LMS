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
        // Create Default Courses
        const defaultCourses = [
            {
                title: 'Bitcoin Fundamentals: The Future of Money',
                slug: 'bitcoin-fundamentals',
                description: 'Understand the history, technology, and economic impact of Bitcoin. Learn about blockchain, mining, Wallets, and the Lightning Network.',
                short_description: 'The complete guide to understanding Bitcoin.',
                price: 49.99,
                instructor_id: (instructor as any).id,
                level: 'beginner',
                language: 'English',
                is_published: true,
                category_slug: 'cryptography',
                thumbnail_url: 'https://images.unsplash.com/photo-1518546305927-5a440cc0c526?w=800'
            },
            {
                title: 'Mastering Ethereum & Smart Contracts',
                slug: 'mastering-ethereum',
                description: 'Deep dive into Ethereum, Solidity, and dApp development. Build secure smart contracts and deploy them to the testnet.',
                short_description: 'Build decentralized applications on Ethereum.',
                price: 89.99,
                instructor_id: (instructor as any).id,
                level: 'advanced',
                language: 'English',
                is_published: true,
                category_slug: 'smart-contracts',
                thumbnail_url: 'https://images.unsplash.com/photo-1622630998477-20aa696fa4f5?w=800'
            },
            {
                title: 'DeFi 101: Decentralized Finance Explained',
                slug: 'defi-101',
                description: 'Learn how to lend, borrow, and trade without banks. Explore Uniswap, Aave, Compound, and the risks of DeFi.',
                short_description: 'Financial freedom through decentralized protocols.',
                price: 69.99,
                instructor_id: (instructor as any).id,
                level: 'intermediate',
                language: 'English',
                is_published: true,
                category_slug: 'blockchain',
                thumbnail_url: 'https://images.unsplash.com/photo-1620321023374-d1a68fddadb3?w=800'
            },
            {
                title: 'AI for Everyone: Neural Networks & ML',
                slug: 'ai-for-everyone',
                description: 'A non-technical introduction to AI, explaining neural networks, deep learning, and how to spot opportunities for AI implementation.',
                short_description: 'Understanding the AI revolution.',
                price: 59.99,
                instructor_id: (instructor as any).id,
                level: 'beginner',
                language: 'English',
                is_published: true,
                category_slug: 'ai-ml',
                thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
            },
            {
                title: 'Python for Machine Learning Bootcamp',
                slug: 'python-ml-bootcamp',
                description: 'Hands-on Python course covering Pandas, NumPy, Scikit-Learn, and TensorFlow. Build real predictive models from scratch.',
                short_description: 'Become a Data Scientist with Python.',
                price: 94.99,
                instructor_id: (instructor as any).id,
                level: 'interactive',
                language: 'English',
                is_published: true,
                category_slug: 'ai-ml',
                thumbnail_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800'
            },
            {
                title: 'Crypto Trading & Technical Analysis',
                slug: 'crypto-trading-101',
                description: 'Master chart patterns, indicators, and risk management strategies specifically for volatile crypto markets.',
                short_description: 'Trade Bitcoin and Altcoins like a pro.',
                price: 129.99,
                instructor_id: (instructor as any).id,
                level: 'intermediate',
                language: 'English',
                is_published: true,
                category_slug: 'cryptography',
                thumbnail_url: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?w=800'
            },
            {
                title: 'Generative AI: Prompt Engineering',
                slug: 'prompt-engineering',
                description: 'Learn how to communicate effectively with LLMs like GPT-4 and Claude. Unlock the full potential of generative AI.',
                short_description: 'Master the art of AI communication.',
                price: 39.99,
                instructor_id: (instructor as any).id,
                level: 'beginner',
                language: 'English',
                is_published: true,
                category_slug: 'ai-ml',
                thumbnail_url: 'https://images.unsplash.com/photo-1535378437327-1e4a64d0dd25?w=800'
            },
            {
                title: 'Solidity Security & Auditing',
                slug: 'solidity-auditing',
                description: 'Advanced course on preventing re-entrancy attacks, overflow bugs, and logic errors in smart contracts.',
                short_description: 'Secure the Web3 ecosystem.',
                price: 149.99,
                instructor_id: (instructor as any).id,
                level: 'advanced',
                language: 'English',
                is_published: true,
                category_slug: 'smart-contracts',
                thumbnail_url: 'https://images.unsplash.com/photo-1639322537228-ad7117a7a6ebd?w=800'
            }
        ]

        for (const c of defaultCourses) {
            // Find category ID
            const { data: cat } = await supabase.from('categories').select('id').eq('slug', c.category_slug).single()

            // Upsert Course
            const { category_slug, ...courseData } = c
            await supabase.from('courses').upsert({
                ...courseData,
                category_id: cat?.id || null
            }, {
                onConflict: 'slug'
            })
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

