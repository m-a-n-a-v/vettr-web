import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description:
    'Manage your VETTR profile, subscription, settings, and preferences.',
  openGraph: {
    title: 'Profile | VETTR',
    description: 'Manage your profile and settings.',
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
