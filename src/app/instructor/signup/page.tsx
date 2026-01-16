import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import { GraduationCap, BookOpen, Target, Award } from 'lucide-react'

export default function InstructorSignupPage() {
    const benefits = [
        { icon: BookOpen, title: 'Global Reach', desc: 'Teach students from over 190 countries around the world.' },
        { icon: Target, title: 'Expert Tools', desc: 'Full control over your curriculum and professional course builder.' },
        { icon: Award, title: 'Build Your Brand', desc: 'Establish yourself as an industry leader in emerging tech.' },
        { icon: GraduationCap, title: 'Revenue Share', desc: 'Industry-leading revenue share models for the best creators.' },
    ]

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="py-24 container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h1 className="text-5xl font-bold tracking-tight">Become an Instructor on <span className="text-primary">Amero X</span></h1>
                            <p className="text-xl text-muted-foreground">
                                Join our network of industry experts and help shape the future of Web3 and AI education.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {benefits.map((b, i) => (
                                    <div key={i} className="space-y-2">
                                        <b.icon className="w-6 h-6 text-primary" />
                                        <h3 className="font-bold">{b.title}</h3>
                                        <p className="text-sm text-muted-foreground">{b.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 text-center">Ready to Teach?</h2>
                            <form className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <input type="text" className="input-field w-full" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expertise Area</label>
                                    <select className="input-field w-full bg-background">
                                        <option>Web3 & Blockchain</option>
                                        <option>AI & Machine Learning</option>
                                        <option>Cybersecurity</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">LinkedIn Profile URL</label>
                                    <input type="url" className="input-field w-full" placeholder="https://linkedin.com/in/..." />
                                </div>
                                <button type="submit" className="btn-primary w-full py-4 mt-4">Apply Now</button>
                            </form>
                            <p className="text-xs text-center text-muted-foreground mt-4">
                                Our team will review your application and get back to you within 3-5 business days.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
