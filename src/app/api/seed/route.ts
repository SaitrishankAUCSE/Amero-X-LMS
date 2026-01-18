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
            },
            {
                title: 'Deep Learning for Web3',
                slug: 'deep-learning-web3',
                description: 'Learn how to integrate neural networks with decentralized applications. This course covers AI-driven smart contracts, decentralized model training, and on-chain inference.',
                short_description: 'Neural networks meet decentralized logic.',
                price: 149.00,
                instructor_id: (instructor as any).id,
                level: 'advanced',
                language: 'English',
                is_published: true,
                category_slug: 'ai-ml',
                thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
            },
            {
                title: 'Advanced Cryptography & ZK-Proofs',
                slug: 'advanced-crypto-zkp',
                description: 'Master Zero-Knowledge Proofs (zk-SNARKs, zk-STARKs) and advanced cryptographic primitives used in modern privacy protocols.',
                short_description: 'Privacy-preserving tech at its finest.',
                price: 199.00,
                instructor_id: (instructor as any).id,
                level: 'advanced',
                language: 'English',
                is_published: true,
                category_slug: 'cryptography',
                thumbnail_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800'
            },
            {
                title: 'Solidity Smart Contract Security',
                slug: 'solidity-security',
                description: 'Learn to write secure code and prevent re-entrancy attacks, frontrunning, and logic flaws in DeFi protocols.',
                short_description: 'Secure your protocols today.',
                price: 129.00,
                instructor_id: (instructor as any).id,
                level: 'intermediate',
                language: 'English',
                is_published: true,
                category_slug: 'smart-contracts',
                thumbnail_url: 'https://images.unsplash.com/photo-16397626801057-074b7f938ba0?w=800'
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
                    // Generate course-specific lessons based on course content
                    const getLessonsForCourse = (title: string, courseId: string) => {
                        const videos = [
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
                        ]

                        // Bitcoin course
                        if (title.includes('Bitcoin')) {
                            return [
                                { title: 'Welcome to Bitcoin Fundamentals', description: 'Course overview, goals, and what you\'ll build. [Download Resources](https://example.com/bitcoin-resources.pdf)', is_free: true },
                                { title: 'What is Bitcoin? History \u0026 Origins', description: 'Understanding the origin story, Satoshi Nakamoto, and the 2008 whitepaper that changed finance forever.', is_free: true },
                                { title: 'How Bitcoin Works: Blockchain Basics', description: 'Deep dive into distributed ledgers, blocks, transactions, and cryptographic hashing (SHA-256).', is_free: false },
                                { title: 'Bitcoin Mining Explained', description: 'Proof of Work consensus, mining pools, difficulty adjustment, and the halving events.', is_free: false },
                                { title: 'Wallets \u0026 Key Management', description: 'Hot wallets vs cold storage, seed phrases, HD wallets, and best security practices.', is_free: false },
                                { title: 'Bitcoin Transactions \u0026 Fees', description: 'UTXOs, transaction inputs/outputs, mempool, and optimizing transaction fees.', is_free: false },
                                { title: 'The Lightning Network', description: 'Layer 2 scaling solution for instant, low-cost Bitcoin transactions.', is_free: false },
                                { title: 'Bitcoin as Money: Economics \u0026 Adoption', description: 'Store of value, unit of account, medium of exchange, and global adoption trends.', is_free: false },
                                { title: 'Bitcoin \u0026 Regulation', description: 'Legal landscape, tax implications, and how governments are responding to Bitcoin.', is_free: false },
                                { title: 'Final Project: Set Up Your Bitcoin Node', description: 'Hands-on tutorial to run a full Bitcoin node and verify the blockchain yourself.', is_free: false }
                            ]
                        }

                        // Ethereum course
                        if (title.includes('Ethereum')) {
                            return [
                                { title: 'Welcome to Ethereum Mastery', description: 'Course roadmap and prerequisites. [Download Starter Code](https://example.com/eth-starter.zip)', is_free: true },
                                { title: 'Ethereum Architecture \u0026 EVM', description: 'Understanding the Ethereum Virtual Machine, gas, and account-based model.', is_free: false },
                                { title: 'Solidity Fundamentals', description: 'Variables, data types, functions, modifiers, and contract structure.', is_free: false },
                                { title: 'Smart Contract Design Patterns', description: 'Factory, Proxy, Diamond, and other essential patterns for scalable dApps.', is_free: false },
                                { title: 'Web3.js \u0026 Ethers.js Integration', description: 'Connecting your frontend to smart contracts using JavaScript libraries.', is_free: false },
                                { title: 'Deploying to Testnets', description: 'Using Hardhat, deploying to Goerli/Sepolia, and verifying contracts on Etherscan.', is_free: false },
                                { title: 'Building a Token (ERC-20)', description: 'Create your own fungible token following the ERC-20 standard.', is_free: false },
                                { title: 'Building an NFT Collection (ERC-721)', description: 'Mint, transfer, and manage non-fungible tokens on Ethereum.', is_free: false },
                                { title: 'Advanced: Gas Optimization', description: 'Techniques to minimize gas costs and make your contracts efficient.', is_free: false },
                                { title: 'Final Project: Full-Stack dApp', description: 'Build and deploy a complete decentralized application from scratch.', is_free: false }
                            ]
                        }

                        // DeFi course
                        if (title.includes('DeFi')) {
                            return [
                                { title: 'Introduction to DeFi', description: 'What is decentralized finance? Core principles and why it matters.', is_free: true },
                                { title: 'Wallets \u0026 DeFi Setup', description: 'Setting up MetaMask, funding wallets, and connecting to DeFi protocols.', is_free: true },
                                { title: 'Decentralized Exchanges (DEXs)', description: 'How Uniswap, SushiSwap, and automated market makers (AMMs) work.', is_free: false },
                                { title: 'Yield Farming \u0026 Liquidity Mining', description: 'Providing liquidity, earning APY, and understanding impermanent loss.', is_free: false },
                                { title: 'Lending \u0026 Borrowing: Aave \u0026 Compound', description: 'How to lend assets, borrow against collateral, and manage liquidation risk.', is_free: false },
                                { title: 'Stablecoins Explained', description: 'USDC, DAI, USDT - how algorithmic and collateralized stablecoins maintain their peg.', is_free: false },
                                { title: 'DeFi Risks \u0026 Security', description: 'Smart contract risks, rug pulls, and how to protect yourself in DeFi.', is_free: false },
                                { title: 'Advanced DeFi: Options \u0026 Derivatives', description: 'Using protocols like dYdX and Synthetix for advanced trading strategies.', is_free: false }
                            ]
                        }

                        // AI Neural Networks course
                        if (title.includes('AI for Everyone')) {
                            return [
                                { title: 'What is Artificial Intelligence?', description: 'Understanding AI, machine learning, and deep learning - the complete landscape.', is_free: true },
                                { title: 'How Neural Networks Learn', description: 'The basics of neurons, layers, weights, and backpropagation explained visually.', is_free: false },
                                { title: 'Supervised vs Unsupervised Learning', description: 'Classification, regression, clustering - when to use each approach.', is_free: false },
                                { title: 'Real-World AI Applications', description: 'From recommendation systems to autonomous vehicles - AI in action.', is_free: false },
                                { title: 'AI Ethics \u0026 Bias', description: 'Understanding algorithmic bias, fairness, and responsible AI development.', is_free: false },
                                { title: 'Computer Vision Basics', description: 'How AI recognizes images, faces, and objects in the real world.', is_free: false },
                                { title: 'Natural Language Processing (NLP)', description: 'Teaching machines to understand human language - from chatbots to translation.', is_free: false },
                                { title: 'The Future of AI', description: 'AGI, AI safety, and where the field is heading in the next decade.', is_free: false }
                            ]
                        }

                        // Python ML course
                        if (title.includes('Python')) {
                            return [
                                { title: 'Python Environment Setup', description: 'Installing Anaconda, Jupyter, and essential libraries for data science.', is_free: true },
                                { title: 'NumPy Essentials', description: 'Arrays, vectorization, and numerical computing with NumPy.', is_free: false },
                                { title: 'Pandas for Data Manipulation', description: 'DataFrames, data cleaning, and exploratory data analysis.', is_free: false },
                                { title: 'Matplotlib \u0026 Seaborn Visualization', description: 'Creating publication-quality plots and understanding your data visually.', is_free: false },
                                { title: 'Scikit-Learn: Your First Model', description: 'Training your first machine learning model with linear regression.', is_free: false },
                                { title: 'Classification Algorithms', description: 'Decision trees, random forests, and logistic regression for prediction.', is_free: false },
                                { title: 'Model Evaluation \u0026 Cross-Validation', description: 'Accuracy, precision, recall, F1-score, and avoiding overfitting.', is_free: false },
                                { title: 'Deep Learning with TensorFlow', description: 'Building neural networks for image classification and beyond.', is_free: false },
                                { title: 'Real Project: Predicting House Prices', description: 'End-to-end ML project from data collection to model deployment.', is_free: false }
                            ]
                        }

                        // Generic fallback for other courses
                        return [
                            { title: `Welcome to ${title}`, description: 'Course introduction and learning objectives. [Download Resources](https://example.com/resources.pdf)', is_free: true },
                            { title: 'Module 1: Fundamentals', description: 'Core concepts and terminology you need to master.', is_free: true },
                            { title: 'Module 2: Practical Applications', description: 'Hands-on exercises to reinforce your understanding.', is_free: false },
                            { title: 'Module 3: Advanced Concepts', description: 'Deep dive into complex topics and edge cases.', is_free: false },
                            { title: 'Module 4: Real-World Projects', description: 'Building production-ready solutions step by step.', is_free: false },
                            { title: 'Module 5: Best Practices', description: 'Industry standards, security, and optimization techniques.', is_free: false },
                            { title: 'Module 6: Tools \u0026 Ecosystem', description: 'Essential tools, libraries, and resources for professionals.', is_free: false },
                            { title: 'Final Project \u0026 Certification', description: 'Capstone project to demonstrate your new skills.', is_free: false }
                        ]
                    }

                    const lessonTemplates = getLessonsForCourse(courseItem.title, courseItem.id)
                    const lessons = lessonTemplates.map((template, index) => ({
                        course_id: courseItem.id,
                        title: template.title,
                        description: template.description,
                        video_url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${index % 2 === 0 ? 'BigBuckBunny' : 'ElephantsDream'}.mp4`,
                        order_index: index + 1,
                        is_free: template.is_free,
                        duration_minutes: Math.floor(Math.random() * 30) + 10 // Random duration 10-40 mins
                    }))

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

