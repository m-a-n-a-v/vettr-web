import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alerts',
  description:
    'Manage your stock alert rules and view recent alert triggers for red flags, filings, and executive changes.',
  openGraph: {
    title: 'Alerts | VETTR',
    description: 'Manage alert rules and view recent triggers.',
  },
}

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
