import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collection Detail',
  description:
    'View stocks in this curated collection and explore investment opportunities.',
  openGraph: {
    title: 'Collection Detail | VETTR',
    description: 'View stocks in this curated collection.',
  },
};

export default function CollectionDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
