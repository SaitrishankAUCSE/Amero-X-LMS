import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20">
        <article className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-6">Last updated: January 16, 2026</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>By accessing and using Amero X, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

            <h2 className="text-2xl font-semibold">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.</p>

            <h2 className="text-2xl font-semibold">3. Content Ownership</h2>
            <p>All course content, including videos, text, and code, is the property of Amero X or its instructors and is protected by copyright laws.</p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}