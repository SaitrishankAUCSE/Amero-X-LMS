import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Mail, MessageSquare, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold">Get in Touch</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Have questions about our courses or platform? Our global support team is here to assist you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="p-8 bg-card border border-white/5 rounded-3xl text-center hover:border-primary/30 transition-all group">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Email Support</h3>
                            <p className="text-sm text-muted-foreground mb-4">For general inquiries and support</p>
                            <a href="mailto:support@ameroxfoundation.com" className="text-primary font-medium hover:underline">support@ameroxfoundation.com</a>
                        </div>

                        <div className="p-8 bg-card border border-white/5 rounded-3xl text-center hover:border-primary/30 transition-all group">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Headquarters</h3>
                            <p className="text-sm text-muted-foreground">
                                123 Innovation Drive, Tech Park<br />
                                Visakhapatnam, Andhra Pradesh<br />
                                India, 530001
                            </p>
                        </div>

                        <div className="p-8 bg-card border border-white/5 rounded-3xl text-center hover:border-primary/30 transition-all group">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Business Hours</h3>
                            <p className="text-sm text-muted-foreground">
                                Monday - Friday<br />
                                9:00 AM - 6:00 PM IST
                            </p>
                        </div>
                    </div>

                    <div className="bg-card border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-8">Send us a Message</h2>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Full Name</label>
                                    <input type="text" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Email Address</label>
                                    <input type="email" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Subject</label>
                                <input type="text" className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors" placeholder="Course Inquiry" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Message</label>
                                <textarea className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:outline-none transition-colors min-h-[150px]" placeholder="How can we help you?"></textarea>
                            </div>

                            <div className="pt-4">
                                <p className="text-xs text-muted-foreground mb-4">
                                    By submitting this form, you acknowledge that Amero X is a commercial educational platform and you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
                                </p>
                                <button type="submit" className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
