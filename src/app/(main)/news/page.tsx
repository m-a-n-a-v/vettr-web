'use client';

import { useState, useMemo } from 'react';
import { useNewsArticles, useMaterialNews, useFilingCalendar } from '@/hooks/useNews';

const SOURCE_LABELS: Record<string, string> = {
  all: 'All Sources',
  bnn: 'BNN Bloomberg',
  sedar: 'SEDAR+',
  tsx_market_maker: 'TSX Market Maker',
  press_release: 'Press Releases',
  globe_investor: 'Globe Investor',
};

const SOURCE_COLORS: Record<string, string> = {
  bnn: 'bg-blue-500/10 text-blue-400',
  sedar: 'bg-purple-500/10 text-purple-400',
  tsx_market_maker: 'bg-green-500/10 text-green-400',
  press_release: 'bg-orange-500/10 text-orange-400',
  globe_investor: 'bg-red-500/10 text-red-400',
};

const FILING_STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/10 text-blue-400',
  filed: 'bg-green-500/10 text-green-400',
  overdue: 'bg-red-500/10 text-red-400',
};

export default function NewsPage() {
  const [activeSource, setActiveSource] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'news' | 'filings'>('news');

  const { articles, isLoading: isLoadingNews } = useNewsArticles({
    source: activeSource === 'all' ? undefined : activeSource,
    limit: 20,
  });
  const { articles: materialNews, isLoading: isLoadingMaterial } = useMaterialNews(5);
  const { filings, isLoading: isLoadingFilings } = useFilingCalendar({ limit: 20 });

  const overdueFilings = useMemo(
    () => filings.filter((f) => f.status === 'overdue'),
    [filings]
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Market news, filings, and material events
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'news'
              ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          News Feed
        </button>
        <button
          onClick={() => setActiveTab('filings')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'filings'
              ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Filing Calendar
          {overdueFilings.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-500/10 text-red-400">
              {overdueFilings.length} overdue
            </span>
          )}
        </button>
      </div>

      {activeTab === 'news' ? (
        <>
          {/* Material News Banner */}
          {materialNews.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-3">
                Material Events
              </h3>
              <div className="space-y-2">
                {materialNews.slice(0, 3).map((article) => (
                  <div key={article.id} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {article.tickers.join(', ')} &middot;{' '}
                        {new Date(article.published_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Filter */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveSource(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeSource === key
                    ? 'bg-vettr-accent/10 text-vettr-accent'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* News List */}
          {isLoadingNews ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-white/5 rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No news articles yet</p>
              <p className="text-sm mt-1">News aggregation will populate as market data flows in.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <a
                  key={article.id}
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
              ))}
            </div>
          )}
        </>
      ) : (
        /* Filing Calendar Tab */
        <>
          {isLoadingFilings ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-white/5 rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/10 rounded mb-2" />
                  <div className="h-3 w-1/3 bg-gray-200 dark:bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : filings.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No upcoming filings</p>
              <p className="text-sm mt-1">Filing calendar entries will appear as they are tracked.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filings.map((filing) => (
                <div
                  key={filing.id}
                  className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-vettr-accent">
                          {filing.ticker}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${FILING_STATUS_COLORS[filing.status] ?? ''}`}>
                          {filing.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {filing.company_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {filing.filing_type} &middot; Expected: {filing.expected_date}
                        {filing.actual_date && ` &middot; Filed: ${filing.actual_date}`}
                      </p>
                    </div>
                    {filing.source_url && (
                      <a
                        href={filing.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-vettr-accent hover:underline flex-shrink-0"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
