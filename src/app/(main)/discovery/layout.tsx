import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discovery',
  description:
    'Discover Canadian small-cap stocks by sector, search for companies, and browse recent filings.',
  openGraph: {
    title: 'Discovery | VETTR',
    description: 'Discover stocks by sector and browse recent filings.',
  },
}

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
