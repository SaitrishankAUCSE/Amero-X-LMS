import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amero X | Global Web3, AI & Blockchain Learning Platform",
  description: "Master the future of technology with Amero X. Industry-leading courses in Web3, AI, and Blockchain taught by world-class experts. Join 8,500+ students worldwide.",
  keywords: "Web3 courses, AI training, Blockchain education, Amero X, professional skills, crypto learning, smart contracts, neural networks",
  openGraph: {
    title: "Amero X | Master Web3, AI & Blockchain",
    description: "Empower your future with world-class online courses in emerging technologies.",
    url: "https://amerox.foundation",
    siteName: "Amero X",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Amero X Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amero X | Master Web3, AI & Blockchain",
    description: "Join the elite 1% of technologists with Amero X's professional courses.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '14px 18px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(142 76% 36%)',
                  secondary: 'white',
                },
                style: {
                  borderLeft: '4px solid hsl(142 76% 36%)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(0 84% 60%)',
                  secondary: 'white',
                },
                style: {
                  borderLeft: '4px solid hsl(0 84% 60%)',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}