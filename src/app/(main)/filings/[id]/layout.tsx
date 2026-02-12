import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const filingId = params.id

  try {
    // Fetch filing data for metadata (server-side)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://vettr-backend.vercel.app/v1'}/filings/${filingId}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return {
        title: 'Filing',
        description: 'View filing details on VETTR.',
      }
    }

    const data = await response.json()
    const filing = data.data

    const title = filing.title || 'Filing'
    const description = `${filing.title} - ${filing.stockTicker} filed on ${new Date(filing.dateFiled).toLocaleDateString()}. ${filing.summary ? filing.summary.substring(0, 150) + '...' : ''}`

    return {
      title,
      description,
      openGraph: {
        title: `${title} | VETTR`,
        description,
        type: 'article',
      },
      twitter: {
        card: 'summary',
        title: `${title} | VETTR`,
        description,
      },
    }
  } catch (error) {
    return {
      title: 'Filing',
      description: 'View filing details on VETTR.',
    }
  }
}

export default function FilingDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
