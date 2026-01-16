import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CheckCircle2, Users, Globe, Award } from 'lucide-react'

export default function AboutPage() {
    const team = [
        {
            name: "Dr. Saitrishank",
            role: "Founder & CEO",
            bio: "Visionary leader with 10+ years in EdTech and Blockchain. Dedicated to democratizing access to Web3 education.",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop"
        },
        {
            name: "Elena Rodriguez",
            role: "Head of Curriculum",
            bio: "Former MIT researcher specializing in AI ethics and curriculum design. Ensures our content meets global standards.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
        },
        {
            name: "David Chen",
            role: "Chief Technology Officer",
            bio: "Blockchain pioneer and smart contract auditor. Leads our technical infrastructure and hands-on labs.",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        },
        {
            name: "Sarah Jenkins",
            role: "Community Director",
            bio: "Building vibrant learning communities. Passionate about connecting students with industry mentors.",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 bg-[url('/grid.svg')] opacity-30" />
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            Building the <span className="text-primary">Future of Education</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Amero X is a premier educational platform dedicated to mastering Web3, AI, and Blockchain.
                            We bridge the gap between theoretical knowledge and real-world application.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-card/50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6 p-8 bg-background rounded-3xl border border-white/5 shadow-xl">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Our Mission</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                To empower the next generation of technologists with practical, high-impact skills that shape the decentralized world. We believe quality education should be accessible, current, and verifiable.
                            </p>
                        </div>
                        <div className="space-y-6 p-8 bg-background rounded-3xl border border-white/5 shadow-xl">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                                <Award className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Our Vision</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                An open, accessible, and elite educational ecosystem where knowledge is shared globally without barriers. We envision a world where anyone, anywhere can master the tools of the future.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats / Trust (Internal Data Placeholder) */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Active Students", value: "8,500+" },
                            { label: "Expert Instructors", value: "120+" },
                            { label: "Online Lessons", value: "450+" },
                            { label: "Satisfaction Rate", value: "4.9/5" },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                                <div className="text-[10px] text-muted-foreground/40">*Internal data as of Jan 2026</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-card/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Meet Our Leadership</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our diverse team brings together experts from leading tech companies and universities worldwide.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="group relative bg-background rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-colors">
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                                    <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
