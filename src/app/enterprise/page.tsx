import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Rocket, Shield, Users, BarChart } from 'lucide-react'

export default function EnterprisePage() {
    const features = [
        { icon: Users, title: 'Team Management', desc: 'Easily manage hundreds of student seats with a unified admin console.' },
        { icon: BarChart, title: 'Advanced Analytics', desc: 'Track progress across your entire organization with deep insights.' },
        { icon: Shield, title: 'Enterprise Security', desc: 'SSO, SAML integration, and dedicated security reviews.' },
        { icon: Rocket, title: 'Custom Curriculum', desc: 'Tailored learning paths designed for your company\'s specific needs.' },
    ]

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="py-24 bg-gradient-to-b from-primary/10 to-transparent">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Amero X for <span className="text-primary">Enterprise</span></h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                            Scale your company's expertise in Web3, AI, and Blockchain with our enterprise-grade learning platform.
                        </p>
                        <button className="btn-primary px-8 py-4 text-lg">Contact Sales</button>
                    </div>
                </section>

                <section className="py-20 container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="p-8 bg-card border border-border rounded-3xl">
                                <f.icon className="w-10 h-10 text-primary mb-4" />
                                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                                <p className="text-muted-foreground text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
