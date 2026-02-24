'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import SearchInput from '@/components/ui/SearchInput'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { ChevronLeftIcon, ChevronDownIcon } from '@/components/icons'

// Glossary terms with definitions
interface GlossaryTerm {
  term: string
  definition: string
  category?: string
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'VETTR Score',
    definition: 'A comprehensive metric (0-100) that evaluates small-cap stocks across multiple dimensions including executive pedigree, filing velocity, red flags, growth metrics, and governance practices. Higher scores indicate better overall quality and lower risk.',
    category: 'VETTR Metrics'
  },
  {
    term: 'Red Flag',
    definition: 'An indicator of potential risk or concern identified through analysis of financial data, executive behavior, or regulatory filings. Red flags are categorized by severity (Low, Moderate, High, Critical) and include issues like executive churn, financing velocity, and disclosure gaps.',
    category: 'VETTR Metrics'
  },
  {
    term: 'Pedigree',
    definition: 'A component of the VETTR Score that evaluates the quality and experience of a company\'s executive team. Factors include education, tenure, previous company experience, specialization, and overall career trajectory.',
    category: 'VETTR Metrics'
  },
  {
    term: 'Filing Velocity',
    definition: 'A component of the VETTR Score that measures the consistency and timeliness of a company\'s regulatory filings. Regular, timely filings indicate good governance and transparency.',
    category: 'VETTR Metrics'
  },
  {
    term: 'Market Cap',
    definition: 'Market Capitalization - the total market value of a company\'s outstanding shares, calculated by multiplying the current stock price by the total number of shares. Used to categorize companies as small-cap, mid-cap, or large-cap.',
    category: 'Financial Terms'
  },
  {
    term: 'MD&A',
    definition: 'Management Discussion & Analysis - a section of a company\'s annual or quarterly report where management discusses the company\'s financial performance, business operations, and future outlook. Required regulatory filing that provides context beyond raw financial numbers.',
    category: 'Filings'
  },
  {
    term: 'Press Release',
    definition: 'An official statement issued by a company to news media and other interested parties. Press releases announce significant events such as earnings results, executive changes, mergers and acquisitions, or new product launches.',
    category: 'Filings'
  },
  {
    term: 'Financial Statements',
    definition: 'Formal records of a company\'s financial activities, including the balance sheet, income statement, and cash flow statement. These documents provide a comprehensive view of a company\'s financial position and performance.',
    category: 'Filings'
  },
  {
    term: 'Material Filing',
    definition: 'A regulatory filing that contains information considered significant enough to influence investor decisions. Material filings may include financial results, major business changes, or other events that could impact stock price.',
    category: 'Filings'
  },
  {
    term: 'Tenure Risk',
    definition: 'An assessment of the likelihood that an executive will leave the company based on factors like time in role, compensation, and career patterns. Categorized as Stable (low risk), Watch (moderate risk), or Flight Risk (high risk).',
    category: 'VETTR Metrics'
  },
  {
    term: 'Executive Churn',
    definition: 'A red flag metric that measures the rate of executive turnover at a company. High executive churn can indicate internal problems, poor governance, or strategic instability.',
    category: 'Red Flags'
  },
  {
    term: 'Financing Velocity',
    definition: 'A red flag metric that tracks the frequency and amount of capital raises. Frequent or large financings may indicate cash flow problems or dilution concerns for existing shareholders.',
    category: 'Red Flags'
  },
  {
    term: 'Consolidation Velocity',
    definition: 'A red flag metric that measures the frequency of stock consolidations (reverse splits). Multiple consolidations in a short period may indicate chronic underperformance and shareholder value destruction.',
    category: 'Red Flags'
  },
  {
    term: 'Disclosure Gaps',
    definition: 'A red flag metric that identifies missing, late, or incomplete regulatory filings. Disclosure gaps can indicate poor governance, financial difficulties, or attempts to hide negative information.',
    category: 'Red Flags'
  },
  {
    term: 'Debt Trend',
    definition: 'A red flag metric that analyzes changes in a company\'s debt levels over time. Rapidly increasing debt without corresponding revenue growth can indicate financial stress.',
    category: 'Red Flags'
  },
  {
    term: 'Small-Cap Stock',
    definition: 'A publicly traded company with a relatively small market capitalization, typically between $300 million and $2 billion. Small-cap stocks often have higher growth potential but also higher risk compared to larger companies.',
    category: 'Financial Terms'
  },
  {
    term: 'Exchange',
    definition: 'The marketplace where securities are bought and sold. Canadian stocks typically trade on the Toronto Stock Exchange (TSX) or TSX Venture Exchange (TSXV). The exchange can indicate company size and regulatory requirements.',
    category: 'Financial Terms'
  },
  {
    term: 'Sector',
    definition: 'A broad category that groups companies based on their primary business activities. Common sectors include Technology, Healthcare, Energy, Materials, Financials, and Consumer sectors. Sector classification helps in comparative analysis.',
    category: 'Financial Terms'
  },
  {
    term: 'Price Change',
    definition: 'The difference between a stock\'s current price and its previous close, typically expressed as a percentage. Positive price changes are shown in green, negative in red.',
    category: 'Financial Terms'
  },
  {
    term: 'Watchlist',
    definition: 'A personalized list of stocks that a user is monitoring. Also called favorites, watchlists allow quick access to stocks of interest and can be used to filter views and set up alerts.',
    category: 'VETTR Features'
  },
  {
    term: 'Alert Rule',
    definition: 'A user-defined notification trigger based on specific stock events or conditions. Alert rules can monitor for red flags, executive changes, financing events, consolidations, or drill results based on chosen frequency.',
    category: 'VETTR Features'
  },
  {
    term: 'Growth Score',
    definition: 'A component of the VETTR Score that evaluates a company\'s financial performance trends, including revenue growth, profitability improvements, and operational efficiency metrics.',
    category: 'VETTR Metrics'
  },
  {
    term: 'Governance Score',
    definition: 'A component of the VETTR Score that assesses a company\'s corporate governance practices, including board composition, executive compensation structure, and shareholder rights.',
    category: 'VETTR Metrics'
  },
  {
    term: 'Drill Results',
    definition: 'Assay results from exploration drilling programs, particularly relevant for mining companies. Significant drill results can materially impact stock valuations in the resource sector.',
    category: 'Financial Terms'
  },
  {
    term: 'Reverse Split',
    definition: 'A corporate action where a company consolidates its shares, reducing the number of shares outstanding while proportionally increasing the share price. Often performed to meet minimum listing requirements or improve optics.',
    category: 'Financial Terms'
  }
]

export default function GlossaryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())

  // Filter terms based on search query
  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) {
      return glossaryTerms
    }

    const query = searchQuery.toLowerCase()
    return glossaryTerms.filter(
      (item) =>
        item.term.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Group terms alphabetically
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {}

    filteredTerms.forEach((term) => {
      const firstLetter = term.term[0].toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(term)
    })

    // Sort each group
    Object.keys(groups).forEach((letter) => {
      groups[letter].sort((a, b) => a.term.localeCompare(b.term))
    })

    return groups
  }, [filteredTerms])

  const toggleTerm = (term: string) => {
    const newExpanded = new Set(expandedTerms)
    if (newExpanded.has(term)) {
      newExpanded.delete(term)
    } else {
      newExpanded.add(term)
    }
    setExpandedTerms(newExpanded)
  }

  const alphabeticalLetters = Object.keys(groupedTerms).sort()

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white/95 dark:bg-vettr-dark border-b border-gray-200 dark:border-white/5 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Back button and Title */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/profile')}
              className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Back to Profile"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Glossary</h1>
          </div>

          {/* Search */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search terms..."
            autoFocus={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Term Count */}
        <div className="mb-6 text-sm text-gray-500">
          {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'}
          {searchQuery.trim() && ' found'}
        </div>

        {/* No Results */}
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No terms found</h3>
            <p className="text-gray-500 mb-4">
              Try a different search term or clear your search.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-vettr-accent hover:text-vettr-accent/80 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Grouped Terms */}
        {alphabeticalLetters.map((letter) => (
          <div key={letter} className="mb-8">
            {/* Letter Header - sticky divider */}
            <div className="flex items-center gap-3 mb-4 sticky top-36 bg-gray-50 dark:bg-vettr-navy py-2 z-10">
              <div className="w-10 h-10 rounded-full bg-vettr-accent/20 flex items-center justify-center">
                <span className="text-vettr-accent font-bold text-lg">{letter}</span>
              </div>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
            </div>

            {/* Terms in this letter group */}
            <div className="space-y-3">
              {groupedTerms[letter].map((item) => {
                const isExpanded = expandedTerms.has(item.term)

                return (
                  <div
                    key={item.term}
                    className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-xl overflow-hidden transition-all hover:border-vettr-accent/20"
                  >
                    {/* Term Header (clickable) */}
                    <button
                      onClick={() => toggleTerm(item.term)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {item.term}
                        </h3>
                        {item.category && (
                          <span className="text-xs text-vettr-accent bg-vettr-accent/10 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Expand/Collapse Icon */}
                      <ChevronDownIcon
                        className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Definition (expandable) */}
                    {isExpanded && (
                      <div
                        className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-white/5 animate-in fade-in duration-200"
                        style={{
                          animation: 'slideDown 200ms ease-out'
                        }}
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.definition}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
