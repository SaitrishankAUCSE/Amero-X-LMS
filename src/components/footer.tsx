'use client'
import Link from 'next/link'
import { Facebook, X, Linkedin, Instagram, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        Platform: [
            { name: 'Browse Courses', href: '/courses' },
            { name: 'Become Instructor', href: '/instructor/signup' },
            { name: 'Enterprise', href: '/enterprise' },
            { name: 'About Us', href: '/about' },
        ],
        Support: [
            { name: 'Help Center', href: '/help' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Privacy Policy', href: '/privacy' },
        ],
        Community: [
            { name: 'Blog', href: '/coming-soon' },
            { name: 'Forum', href: '/coming-soon' },
            { name: 'Events', href: '/coming-soon' },
            { name: 'Affiliates', href: '/coming-soon' },
        ],
    }

    const socialLinks = [
        { icon: Facebook, href: 'https://facebook.com/amerox', label: 'Facebook' },
        { icon: X, href: 'https://x.com/amerox_edu', label: 'X (Twitter)' },
        { icon: Linkedin, href: 'https://linkedin.com/company/amerox', label: 'LinkedIn' },
        { icon: Instagram, href: 'https://instagram.com/amerox_edu', label: 'Instagram' },
    ]

    return (
        <footer className="border-t border-border bg-card mt-auto font-sans">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight">Amero X</span>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
                            Empowering the next generation of builders with world-class education in Web3, AI, and Blockchain technologies. Join our global community today.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-primary/20"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="font-bold text-foreground mb-5 uppercase tracking-wider text-xs">{category}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 block"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="mt-16 pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="max-w-md">
                            <h3 className="font-bold text-xl text-foreground mb-2">Join our Newsletter</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">Stay updated with the latest course releases, tech insights, and exclusive community events.</p>
                        </div>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                const form = e.target as HTMLFormElement
                                const emailInput = form.elements.namedItem('email') as HTMLInputElement
                                const email = emailInput.value

                                if (email) {
                                    const loadingToast = toast.loading('Subscribing...')
                                    try {
                                        const res = await fetch('/api/newsletter', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email })
                                        })
                                        if (res.ok) {
                                            toast.success(`Welcome to Amero X! Check your inbox soon.`, { id: loadingToast })
                                            form.reset()
                                        } else {
                                            toast.error('Subscription failed. Please try again.', { id: loadingToast })
                                        }
                                    } catch (err) {
                                        toast.error('Network error. Please try again.', { id: loadingToast })
                                    }
                                }
                            }}
                            className="flex w-full md:w-auto gap-3"
                        >
                            <div className="relative flex-1 md:w-80 group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
                                    suppressHydrationWarning
                                />
                            </div>
                            <button type="submit" className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap" suppressHydrationWarning>
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Disclaimer - Compliance */}
                <div className="mt-16 pt-8 border-t border-white/5 text-xs text-muted-foreground/60 leading-relaxed text-center max-w-4xl mx-auto">
                    <p className="mb-2">
                        <strong>Disclaimer:</strong> Amero X is a for-profit commercial educational platform operating under the domain <em>ameroxfoundation.com</em>.
                        We are not a 501(c)(3) non-profit organization, charity, or foundation. The term "Foundation" in our domain refers to the
                        educational foundations we provide to our students.
                    </p>
                    <p>
                        All statistics regarding student numbers, course completions, and satisfaction rates are based on internal data as of January 2026.
                        Past performance is not indicative of future results in trading or investment courses.
                    </p>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <p suppressHydrationWarning>© {currentYear} Amero X. All rights reserved.</p>
                        <div className="hidden md:block w-px h-4 bg-white/10" />
                        <div className="flex gap-4 items-center">
                            <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">Verified Security</span>
                            <div className="flex gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <img src="https://img.shields.io/badge/SSL-Secured-green?style=flat-square&logo=letsencrypt" alt="SSL" className="h-5" />
                                <img src="https://img.shields.io/badge/Payments-Encrypted-blue?style=flat-square&logo=stripe" alt="Stripe" className="h-5" />
                                <img src="https://img.shields.io/badge/PCI-Compliant-lightgrey?style=flat-square" alt="PCI" className="h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex gap-6">
                            <Link href="/terms" className="hover:text-primary transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy" className="hover:text-primary transition-colors">
                                Privacy
                            </Link>
                            <Link href="/cookies" className="hover:text-primary transition-colors">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer >
    )
}
