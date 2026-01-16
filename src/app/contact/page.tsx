import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Mail, MessageSquare, Phone } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                        <p className="text-xl text-muted-foreground">We're here to help you on your learning journey.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="p-6 bg-card border border-border rounded-2xl text-center">
                            <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">Email Support</h3>
                            <p className="text-sm text-muted-foreground">support@amerox.foundation</p>
                        </div>
                        <div className="p-6 bg-card border border-border rounded-2xl text-center">
                            <MessageSquare className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">Live Chat</h3>
                            <p className="text-sm text-muted-foreground">Available 9am - 6pm EST</p>
                        </div>
                        <div className="p-6 bg-card border border-border rounded-2xl text-center">
                            <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">Phone</h3>
                            <p className="text-sm text-muted-foreground">+1 (555) 000-0000</p>
                        </div>
                    </div>

                    <form className="max-w-xl mx-auto space-y-6 bg-card p-8 border border-border rounded-3xl shadow-xl">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <input type="text" className="input-field w-full" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <input type="email" className="input-field w-full" placeholder="john@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <input type="text" className="input-field w-full" placeholder="How can we help?" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <textarea className="input-field w-full min-h-[150px]" placeholder="Tell us more about your inquiry..."></textarea>
                        </div>
                        <button type="submit" className="btn-primary w-full py-4">Send Message</button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    )
}
