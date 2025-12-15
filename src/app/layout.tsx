import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], fallback: ['system-ui', 'arial'] })

export const metadata: Metadata = {
  title: 'SolarClose - Solar ROI Calculator',
  description: 'Offline-first solar ROI calculator for sales representatives',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'SolarClose - Solar ROI Calculator',
    description: 'Professional PWA for solar sales representatives to calculate ROI and generate branded proposals',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SolarClose - Solar ROI Calculator',
    description: 'Professional PWA for solar sales representatives',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFC107',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}