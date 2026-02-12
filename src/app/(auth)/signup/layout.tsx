import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a VETTR account to start analyzing Canadian small-cap stocks.',
  openGraph: {
    title: 'Sign Up | VETTR',
    description: 'Create a VETTR account.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
