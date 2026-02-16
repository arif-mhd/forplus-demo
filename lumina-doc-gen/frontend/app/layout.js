import '../styles/globals.css'

export const metadata = {
    title: 'Lumina DocGen',
    description: 'AI-Powered Document Generator',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
