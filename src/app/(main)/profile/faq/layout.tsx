import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about VETTR, including information on scoring, red flags, alerts, and subscriptions.',
  openGraph: {
    title: 'FAQ | VETTR',
    description: 'Frequently asked questions about VETTR.',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
