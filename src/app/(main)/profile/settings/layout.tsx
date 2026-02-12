import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure your notification preferences, alerts, and appearance settings.',
  openGraph: {
    title: 'Settings | VETTR',
    description: 'Configure your preferences and settings.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
