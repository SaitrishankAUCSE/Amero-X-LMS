import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Search, Book, MessageCircle, LifeBuoy } from 'lucide-react'

export default function HelpPage() {
  const categories = [
    { icon: Book, title: 'Getting Started', desc: 'Learn the basics of using Amero X.' },
    { icon: MessageCircle, title: 'Account & Billing', desc: 'Manage your profile and subscriptions.' },
    { icon: LifeBuoy, title: 'Technical Support', desc: 'Troubleshoot common platform issues.' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input type="text" className="input-field w-full pl-12 py-4" placeholder="Search for answers..." />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          {categories.map((cat, i) => (
            <div key={i} className="p-8 bg-card border border-border rounded-3xl hover:border-primary/50 transition-all cursor-pointer">
              <cat.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
              <p className="text-muted-foreground">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I access my courses?', a: 'Once you purchase a course, it will appear in your dashboard under "My Learning".' },
              { q: 'Can I get a refund?', a: 'We offer a 30-day money-back guarantee for all courses if you are not satisfied.' },
              { q: 'Are the certificates verified?', a: 'Yes, all Amero X certificates are verifiable and can be shared on LinkedIn.' },
            ].map((faq, i) => (
              <div key={i} className="p-6 bg-secondary/20 rounded-2xl">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}