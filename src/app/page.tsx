import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import { BookOpen, Users, Award, TrendingUp, Shield, Zap } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import CourseCard from '@/components/course-card'
import HeroSection from '@/components/hero-section'
import FeaturedCourses from '@/components/featured-courses'
import FaqSection from '@/components/faq-section'

export default async function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with real-world experience'
    },
    {
      icon: Users,
      title: 'Community Learning',
      description: 'Connect with thousands of students worldwide'
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn verified certificates upon course completion'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and encrypted transactions with multiple payment options'
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Start learning immediately after enrollment'
    },
  ]

  const stats = [
    { value: '8,500+', label: 'Active Students' },
    { value: '120+', label: 'Expert Instructors' },
    { value: '450+', label: 'Online Lessons' },
    { value: '4.9/5', label: 'Average Rating' },
  ]

  // Fetch Featured Courses
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: popularCourses } = await supabase
    .from('courses')
    .select(`
        *,
        profiles:instructor_id (full_name, avatar_url),
        categories (name)
    `)
    .eq('is_published', true)
    .limit(3)

  const mappedCourses = popularCourses?.map(course => ({
    ...course,
    instructor_name: (course.profiles as any)?.full_name || 'Expert Instructor'
  }))

  return (
    <div id="main-content" className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />

      {/* Featured Courses Section */}
      {mappedCourses && mappedCourses.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
              <p className="text-muted-foreground">Start with our most popular content</p>
            </div>
            <FeaturedCourses courses={mappedCourses} />
            <div className="text-center mt-12">
              <Link href="/courses" className="btn-secondary">View All Courses</Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-12 uppercase tracking-widest font-medium">
            *Stats based on internal platform data and projected growth as of Jan 2026
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it Works</h2>
            <p className="text-muted-foreground text-lg">Your path to mastering emerging technologies in four easy steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up in seconds and get access to our global learning community.' },
              { step: '02', title: 'Pick a Path', desc: 'Choose from expert-led courses in Web3, AI, or advanced Cryptography.' },
              { step: '03', title: 'Learn by Doing', desc: 'Complete hands-on projects and quizzes to solidify your knowledge.' },
              { step: '04', title: 'Get Certified', desc: 'Earn a verified certificate to showcase your skills to the world.' },
            ].map((s, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-card/50 border border-border backdrop-blur-sm">
                <div className="text-6xl font-black text-primary/10 absolute top-4 right-6">{s.step}</div>
                <h3 className="text-xl font-bold mb-3 relative z-10">{s.title}</h3>
                <p className="text-muted-foreground text-sm relative z-10 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Join thousands of satisfied learners.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Rivera",
                role: "Senior Web3 Architect",
                content: "Amero X provided the most structured and deep-dive Web3 curriculum I've seen. The smart contract security module alone saved me months of self-study.",
                avatar: "https://i.pravatar.cc/150?u=alex"
              },
              {
                name: "Sarah Chen",
                role: "Machine Learning Engineer",
                content: "The level of mathematical rigor in their Neural Networks course is exceptional. It bridges the gap between theory and real-world deployment perfectly.",
                avatar: "https://i.pravatar.cc/150?u=sarah"
              },
              {
                name: "David K. Hoffmann",
                role: "Security Researcher",
                content: "Hands-down the best resources for advanced Cryptography. The focus on zero-knowledge proofs is incredibly relevant for today's privacy-focused systems.",
                avatar: "https://i.pravatar.cc/150?u=david"
              },
              {
                name: "Priya Sharma",
                role: "Blockchain Developer",
                content: "I transitioned from Web2 to Web3 thanks to Amero X. The capstone projects are challenging and actually prepare you for real client work.",
                avatar: "https://i.pravatar.cc/150?u=priya"
              },
              {
                name: "Marcus Johnson",
                role: "DeFi Strategist",
                content: "The tokenomics modules are world-class. Finally, a course that explains the math behind AMMs without getting lost in jargon.",
                avatar: "https://i.pravatar.cc/150?u=marcus"
              },
              {
                name: "Elena Volkov",
                role: "AI Ethics Researcher",
                content: "Crucial insights into the intersection of AI and blockchain governance. Highly recommended for policy makers and researchers.",
                avatar: "https://i.pravatar.cc/150?u=elena"
              }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-card border border-border shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Award className="w-12 h-12 text-primary" />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full border-2 border-primary/20 p-1" />
                  <div>
                    <div className="font-extrabold text-foreground">{t.name}</div>
                    <div className="text-xs font-medium text-primary uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed italic relative z-10 text-sm">"{t.content}"</p>
                <div className="mt-6 flex text-yellow-500 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Zap key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students already learning on Amero X. Get instant access to all courses.
          </p>
          <Link href="/sign-up" className="inline-block bg-background text-foreground hover:bg-background/90 px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105">
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
