import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SolarClose - Solar ROI Calculator',
  description: 'Offline-first solar ROI calculator for sales representatives',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFC107',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} animate-gradient-shift`} style={{
        background: 'linear-gradient(-45deg, #FFF8E1, #FFE082, #FFC107, #FF8F00, #E65100, #FFC107, #FFE082)',
        backgroundSize: '400% 400%'
      }}>
        {children}
      </body>
    </html>
  )
}