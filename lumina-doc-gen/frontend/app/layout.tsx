import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Lumina DocGen',
    description: 'AI-Powered Document Generator',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-[#050505] text-gray-200 antialiased selection:bg-indigo-500/30">
                {children}
            </body>
        </html>
    )
}
