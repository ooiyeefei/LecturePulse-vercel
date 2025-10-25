import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StackProvider, StackTheme } from "@stackframe/stack"
import { stackServerApp } from "@/stack"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LecturePulse',
  description: 'Interactive educational quiz platform powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <div className="min-h-screen bg-background">
              {children}
            </div>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  )
}