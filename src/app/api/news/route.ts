import { NextResponse } from 'next/server';

export interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  imageUrl: string | null;
}

// BNN Bloomberg Markets RSS feed (Canadian-focused financial news)
const RSS_URL = 'https://www.bnnbloomberg.ca/arc/outboundfeeds/rss/category/markets/';

// Cache the response for 10 minutes (600 seconds)
export const revalidate = 600;

/**
 * GET /api/news
 * Fetches and parses the BNN Bloomberg Markets RSS feed.
 * Returns a JSON array of news items for the frontend.
 */
export async function GET() {
  try {
    const response = await fetch(RSS_URL, {
      next: { revalidate: 600 }, // Next.js fetch cache: 10 minutes
      headers: {
        'User-Agent': 'VETTR/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch news feed', status: response.status },
        { status: 502 }
      );
    }

    const xml = await response.text();
    const items = parseRSS(xml);

    return NextResponse.json({
      source: 'BNN Bloomberg',
      source_url: 'https://www.bnnbloomberg.ca/markets/',
      fetched_at: new Date().toISOString(),
      items,
    });
  } catch (error) {
    console.error('News RSS fetch error:', error);
    return NextResponse.json(
      { error: 'Internal error fetching news' },
      { status: 500 }
    );
  }
}

/**
 * Simple XML RSS parser — extracts <item> elements without requiring
 * an XML parsing library. Works for well-formed RSS 2.0 feeds.
 */
function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Extract all <item>...</item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = extractCDATA(block, 'title') || extractTag(block, 'title') || '';
    const link = extractTag(block, 'link') || '';
    const description = extractCDATA(block, 'description') || extractTag(block, 'description') || '';
    const pubDate = extractTag(block, 'pubDate') || '';
    const creator = extractCDATA(block, 'dc:creator') || extractTag(block, 'dc:creator') || 'BNN Bloomberg';

    // Extract media:content image URL
    const mediaMatch = block.match(/<media:content[^>]+url="([^"]+)"/);
    const imageUrl = mediaMatch ? mediaMatch[1] : null;

    if (title && link) {
      items.push({
        title: cleanText(title),
        link,
        description: cleanText(description),
        pubDate,
        source: cleanText(creator),
        imageUrl,
      });
    }
  }

  return items;
}

/** Extract content from <tag><![CDATA[...]]></tag> */
function extractCDATA(block: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`);
  const match = block.match(regex);
  return match ? match[1] : null;
}

/** Extract content from <tag>...</tag> */
function extractTag(block: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = block.match(regex);
  return match ? match[1].trim() : null;
}

/** Strip HTML tags and decode common entities */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
