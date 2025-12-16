import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ServiceWorkerManager } from '@/components/ServiceWorkerManager'

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
  try {
    return (
      <html lang="en" className="dark">
        <body className={inter.className}>
          <ServiceWorkerManager />
          {children}
        </body>
      </html>
    )
  } catch (error) {
    const sanitizedError = error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : String(error).replace(/[\r\n]/g, ' ');
    console.error('Layout rendering error:', sanitizedError);
    return (
      <html lang="en" className="dark">
        <body className={inter.className}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Something went wrong</h1>
            <p>Please refresh the page</p>
          </div>
        </body>
      </html>
    )
  }
}