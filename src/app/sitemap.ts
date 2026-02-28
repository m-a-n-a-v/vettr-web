import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vettr.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vettr-backend.vercel.app/v1';

async function getStockTickers(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/public/stocks?limit=500`, {
      next: { revalidate: 3600 }, // Refresh hourly
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((s: { ticker: string }) => s.ticker);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/stocks`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/pulse`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const tickers = await getStockTickers();
  const stockRoutes: MetadataRoute.Sitemap = tickers.map(ticker => ({
    url: `${BASE_URL}/stocks/${ticker}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...stockRoutes];
}
