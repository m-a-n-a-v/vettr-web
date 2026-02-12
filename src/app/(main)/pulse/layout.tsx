import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pulse',
  description:
    'Market overview dashboard showing top VETTR scores, recent filings, and market trends for Canadian small-cap stocks.',
  openGraph: {
    title: 'Pulse | VETTR',
    description:
      'Market overview dashboard with top stocks, recent filings, and trends.',
  },
}

export default function PulseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
