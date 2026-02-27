'use client';

import type { NewsArticle } from '@/types/portfolio';

interface NewsCardProps {
  article: NewsArticle;
}

const SOURCE_COLORS: Record<string, string> = {
  bnn: 'bg-blue-500/10 text-blue-400',
  sedar: 'bg-purple-500/10 text-purple-400',
  tsx_market_maker: 'bg-green-500/10 text-green-400',
  press_release: 'bg-orange-500/10 text-orange-400',
  globe_investor: 'bg-red-500/10 text-red-400',
};

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <a
      href={article.source_url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-white/5 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-white/[0.07] transition-colors border border-gray-100 dark:border-white/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${SOURCE_COLORS[article.source] ?? 'bg-gray-500/10 text-gray-400'}`}>
              {article.source.replace('_', ' ')}
            </span>
            {article.is_material && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-400">
                Material
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span>{new Date(article.published_at).toLocaleDateString()}</span>
            {article.tickers.length > 0 && (
              <>
                <span>&middot;</span>
                <span>{article.tickers.slice(0, 5).join(', ')}</span>
              </>
            )}
          </div>
        </div>
        {article.image_url && (
          <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-white/10 flex-shrink-0 overflow-hidden">
            <img
              src={article.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </a>
  );
}
