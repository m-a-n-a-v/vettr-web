'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import SearchInput from '@/components/ui/SearchInput'

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
    <div className="min-h-screen bg-primary text-textPrimary pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-primaryLight border-b border-border sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/profile')}
              className="text-textSecondary hover:text-textPrimary transition-colors"
              aria-label="Back to Profile"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Glossary</h1>
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
        <div className="mb-6 text-sm text-textSecondary">
          {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'}
          {searchQuery.trim() && ' found'}
        </div>

        {/* No Results */}
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-lg font-semibold mb-2">No terms found</h3>
            <p className="text-textSecondary mb-4">
              Try a different search term or clear your search.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-accent hover:text-accentDim transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Grouped Terms */}
        {alphabeticalLetters.map((letter) => (
          <div key={letter} className="mb-8">
            {/* Letter Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-bold text-lg">{letter}</span>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Terms in this letter group */}
            <div className="space-y-3">
              {groupedTerms[letter].map((item) => {
                const isExpanded = expandedTerms.has(item.term)

                return (
                  <div
                    key={item.term}
                    className="bg-primaryLight border border-border rounded-lg overflow-hidden transition-all hover:border-accent/30"
                  >
                    {/* Term Header (clickable) */}
                    <button
                      onClick={() => toggleTerm(item.term)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-surfaceLight transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-textPrimary mb-1">
                          {item.term}
                        </h3>
                        {item.category && (
                          <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`w-5 h-5 text-textSecondary transition-transform flex-shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Definition (expandable) */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-border bg-primary/50">
                        <p className="text-textSecondary leading-relaxed">
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
