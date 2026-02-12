import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stocks',
  description:
    'Browse all tracked Canadian small-cap stocks with VETTR scores, prices, and sector information.',
  openGraph: {
    title: 'Stocks | VETTR',
    description: 'Browse all tracked Canadian small-cap stocks.',
  },
}

export default function StocksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
