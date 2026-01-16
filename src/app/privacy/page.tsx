import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20">
        <article className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: January 16, 2026</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Information Collection</h2>
            <p>We collect information you provide directly to us when you create an account, purchase a course, or contact us for support.</p>

            <h2 className="text-2xl font-semibold">2. Use of Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you about your account.</p>

            <h2 className="text-2xl font-semibold">3. Data Security</h2>
            <p>We implement reasonable security measures to protect your personal information from unauthorized access or disclosure.</p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}