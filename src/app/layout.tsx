import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ServiceWorkerManager } from '@/components/ServiceWorkerManager'

const inter = Inter({ subsets: ['latin'], fallback: ['system-ui', 'arial'] })

export const metadata: Metadata = {
  title: 'SolarClose - Free Solar Proposal Tool for Sales Reps | Works Offline',
  description: 'Free solar proposal calculator for sales reps. Generate professional PDF proposals instantly. Works offline, no signup required. Calculate 25-year savings, ROI, and payback period on any device.',
  keywords: ['solar calculator', 'solar proposal tool', 'solar sales software', 'solar ROI calculator', 'solar savings calculator', 'offline solar tool', 'solar panel calculator', 'solar proposal generator', 'free solar calculator', 'solar sales tool'],
  authors: [{ name: 'Teycir Ben Soltane', url: 'https://teycirbensoltane.tn' }],
  creator: 'Teycir Ben Soltane',
  publisher: 'SolarClose',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'SolarClose - Free Solar Proposal Tool for Sales Reps',
    description: 'Generate professional solar proposals instantly. Works offline, calculates 25-year savings, ROI, and payback period. Free for individual sales reps.',
    type: 'website',
    url: 'https://solarclose.pages.dev',
    siteName: 'SolarClose',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolarClose - Free Solar Proposal Tool',
    description: 'Generate professional solar proposals instantly. Works offline. Free for sales reps.',
    creator: '@teycir',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://solarclose.pages.dev',
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
        <ServiceWorkerManager />
        {children}
      </body>
    </html>
  )
}