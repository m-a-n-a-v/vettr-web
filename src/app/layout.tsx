import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { SWRProvider } from '@/lib/swr-config'
import { ToastProvider } from '@/contexts/ToastContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import OfflineBanner from '@/components/ui/OfflineBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | VETTR',
    default: 'VETTR - Stock Analysis Platform for Canadian Small-Cap Stocks',
  },
  description:
    'VETTR is a comprehensive stock analysis platform focused on Canadian small-cap stocks. Track VETTR scores, red flags, executive pedigree, filings, and alerts.',
  keywords: [
    'stock analysis',
    'Canadian stocks',
    'small-cap stocks',
    'VETTR score',
    'red flags',
    'executive pedigree',
    'stock filings',
    'stock alerts',
  ],
  authors: [{ name: 'VETTR' }],
  creator: 'VETTR',
  publisher: 'VETTR',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://vettr.vercel.app'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: '/',
    title: 'VETTR - Stock Analysis Platform',
    description:
      'Comprehensive stock analysis platform for Canadian small-cap stocks with VETTR scores, red flags, and executive insights.',
    siteName: 'VETTR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VETTR Stock Analysis Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VETTR - Stock Analysis Platform',
    description:
      'Comprehensive stock analysis platform for Canadian small-cap stocks.',
    images: ['/og-image.png'],
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
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <SWRProvider>
            <AuthProvider>
              <ToastProvider>
                <OfflineBanner />
                {children}
              </ToastProvider>
            </AuthProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
