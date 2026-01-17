'use client'

import { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'

export default function FaqSection() {
    const faqs = [
        {
            question: "Is Amero X a certified university?",
            answer: "No, Amero X is a professional skills platform, not an accredited university. We provide industry-recognized certificates of completion that demonstrate your practical skills to employers, but they do not carry academic credits."
        },
        {
            question: "Why does the URL say 'foundation'?",
            answer: "The 'ameroxfoundation.com' domain represents the foundational knowledge we build for our students. Amero X is a commercial, for-profit education provider, and we are legally separate from any non-profit entities."
        },
        {
            question: "Are the instructors real experts?",
            answer: "Yes. Our courses are created by senior engineers, researchers, and developers who currently work in the Web3 and AI industries. We verify every instructor's background before they are allowed to publish on Amero X."
        },
        {
            question: "How do I access the course material?",
            answer: "Once you enroll, you get instant lifetime access to the course content through your student dashboard. You can learn at your own pace, on any device."
        },
        {
            question: "What is your refund policy?",
            answer: "We offer a 14-day money-back guarantee for all courses, provided you have not completed more than 30% of the course content. We want you to be satisfied with your learning journey."
        }
    ]

    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground text-lg">None of your questions should go unanswered.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-2xl transition-all duration-300 ${openIndex === index
                                ? 'bg-card border-primary/50 shadow-lg'
                                : 'bg-card/50 border-white/5 hover:border-white/20'
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-semibold text-lg">{faq.question}</span>
                                {openIndex === index ? (
                                    <Minus className="w-5 h-5 text-primary shrink-0 ml-4" />
                                ) : (
                                    <Plus className="w-5 h-5 text-muted-foreground shrink-0 ml-4" />
                                )}
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
