import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your VETTR account to access stock analysis and alerts.',
  openGraph: {
    title: 'Login | VETTR',
    description: 'Sign in to your VETTR account.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
