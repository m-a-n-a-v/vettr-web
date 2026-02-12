import type { Metadata } from 'next'
import { api } from '@/lib/api-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>
}): Promise<Metadata> {
  const { ticker: rawTicker } = await params
  const ticker = rawTicker.toUpperCase()

  try {
    // Fetch stock data for metadata (server-side)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://vettr-backend.vercel.app/v1'}/stocks/${ticker}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return {
        title: `${ticker}`,
        description: `View detailed analysis for ${ticker} on VETTR.`,
      }
    }

    const data = await response.json()
    const stock = data.data

    const title = `${stock.ticker} - ${stock.companyName}`
    const description = `${stock.companyName} (${stock.ticker}) - VETTR Score: ${stock.vetrScore || 'N/A'}, Sector: ${stock.sector || 'N/A'}. View detailed stock analysis, executive pedigree, red flags, and filings.`

    return {
      title,
      description,
      openGraph: {
        title: `${title} | VETTR`,
        description,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${title} | VETTR`,
        description,
      },
    }
  } catch (error) {
    return {
      title: `${ticker}`,
      description: `View detailed analysis for ${ticker} on VETTR.`,
    }
  }
}

export default function StockDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
