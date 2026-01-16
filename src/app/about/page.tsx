import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-20">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h1 className="text-4xl font-bold">About Amero X</h1>
                    <p className="text-xl text-muted-foreground">
                        Amero X is a leading educational platform dedicated to mastering the technologies of the future.
                        We focus on Web3, Artificial Intelligence, and Blockchain, providing industry-leading courses
                        taught by professionals at the forefront of these fields.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                            <p>To empower the next generation of technologists with practical, high-impact skills that shape the decentralized world.</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
                            <p>An open, accessible, and elite educational ecosystem where knowledge is shared globally without barriers.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
