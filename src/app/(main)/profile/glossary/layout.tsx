import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Glossary',
  description:
    'Financial and VETTR-specific terms explained. Learn about VETTR scores, red flags, pedigree, and more.',
  openGraph: {
    title: 'Glossary | VETTR',
    description: 'Financial and VETTR-specific terms explained.',
  },
}

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
