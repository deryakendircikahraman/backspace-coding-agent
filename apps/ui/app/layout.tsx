import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Backspace - AI-Powered Code Generation',
  description: 'Automatically create pull requests to GitHub repositories based on natural language prompts',
  keywords: ['AI', 'code generation', 'GitHub', 'pull requests', 'automation'],
  authors: [{ name: 'Backspace Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {children}
      </body>
    </html>
  )
} 