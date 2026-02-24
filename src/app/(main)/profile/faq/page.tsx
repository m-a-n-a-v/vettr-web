'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import SearchInput from '@/components/ui/SearchInput'
import { ChevronLeftIcon, ChevronDownIcon } from '@/components/icons'

// FAQ items
interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqItems: FAQItem[] = [
  {
    question: 'What is the VETTR Score?',
    answer: 'The VETTR Score is a comprehensive metric ranging from 0 to 100 that evaluates small-cap stocks across multiple dimensions. It combines analysis of executive pedigree, filing velocity, red flags, growth metrics, and governance practices. Higher scores indicate better overall quality and lower risk. The score is calculated using proprietary algorithms that weight each component based on its importance to long-term stock performance.',
    category: 'VETTR Score'
  },
  {
    question: 'How is the VETTR Score calculated?',
    answer: 'The VETTR Score is calculated from five main components: Pedigree Score (evaluating executive quality), Filing Velocity (measuring regulatory compliance), Red Flag Score (assessing risk factors), Growth Score (analyzing financial performance trends), and Governance Score (evaluating corporate governance practices). Each component is weighted and combined, with bonus points for exceptional performance and penalties for concerning patterns. The final score is normalized to a 0-100 scale.',
    category: 'VETTR Score'
  },
  {
    question: 'How often is the VETTR Score updated?',
    answer: 'VETTR Scores are recalculated automatically whenever new data becomes available. This includes updates when new filings are released, stock prices change significantly, or executive changes occur. Typically, scores are refreshed at least daily, with some components updating more frequently based on real-time data availability.',
    category: 'VETTR Score'
  },
  {
    question: 'What is a good VETTR Score?',
    answer: 'VETTR Scores are color-coded for easy interpretation: 80-100 (green) indicates excellent quality with minimal risks, 60-79 (yellow) suggests good quality with some areas to watch, 40-59 (orange) indicates moderate quality with notable concerns, and below 40 (red) suggests significant risks and poor quality indicators. However, scores should always be considered in context with other factors and sector-specific considerations.',
    category: 'VETTR Score'
  },
  {
    question: 'What are Red Flags?',
    answer: 'Red Flags are warning indicators that identify potential risks or concerns about a stock. They are detected through analysis of financial data, executive behavior, and regulatory filings. Red Flags are categorized by severity (Low, Moderate, High, Critical) and include issues like executive churn, high financing velocity, consolidation patterns, disclosure gaps, and negative debt trends. Each flag includes a detailed explanation of why it matters.',
    category: 'Red Flags'
  },
  {
    question: 'How should I interpret Red Flags?',
    answer: 'Red Flags should be viewed as areas requiring further investigation rather than automatic reasons to avoid a stock. A single Low or Moderate flag may not be concerning, but multiple High or Critical flags warrant careful scrutiny. Consider the context: industry norms, company size, growth stage, and recent events. The Red Flag Score combines all detected flags into a single metric (0-100), with lower scores indicating higher risk.',
    category: 'Red Flags'
  },
  {
    question: 'Can I acknowledge or dismiss Red Flags?',
    answer: 'Yes, you can acknowledge individual Red Flags or all flags for a stock once you\'ve reviewed them. Acknowledged flags are marked with a checkmark and dimmed in the interface, making it easier to track which concerns you\'ve already investigated. This is purely for your own tracking - acknowledged flags still impact the Red Flag Score calculation.',
    category: 'Red Flags'
  },
  {
    question: 'What does the Pedigree Score measure?',
    answer: 'The Pedigree Score evaluates the quality and experience of a company\'s executive team. It considers factors including education credentials, total years of experience, time in current role (tenure), previous company experience, industry specialization, and overall career trajectory. Strong pedigree suggests experienced leadership capable of navigating challenges and executing strategy effectively.',
    category: 'Executive Pedigree'
  },
  {
    question: 'What is Tenure Risk?',
    answer: 'Tenure Risk assesses the likelihood that an executive will leave the company based on factors like time in role, compensation patterns, and career history. It\'s categorized as Stable (low flight risk), Watch (moderate risk), or Flight Risk (high likelihood of departure). High executive turnover can indicate internal problems, so monitoring tenure risk helps identify potential instability.',
    category: 'Executive Pedigree'
  },
  {
    question: 'How do I add stocks to my Watchlist?',
    answer: 'Click the star icon on any stock card or on the stock detail page header to add it to your Watchlist (favorites). The star will fill in to indicate the stock is favorited. You can view all your favorited stocks by toggling the "Favorites Only" filter on the Stocks page. Your Watchlist is synced to your account and accessible across all your devices.',
    category: 'Watchlist & Favorites'
  },
  {
    question: 'Is there a limit to how many stocks I can favorite?',
    answer: 'Watchlist limits depend on your subscription tier. Free accounts can favorite up to 10 stocks, Pro accounts up to 50 stocks, and Premium accounts have unlimited favorites. You can check your current usage and limits in your Profile under the Subscription section.',
    category: 'Watchlist & Favorites'
  },
  {
    question: 'How do Alert Rules work?',
    answer: 'Alert Rules let you set up automated notifications for specific stock events or conditions. You can create rules to monitor for red flags, executive changes, financing events, consolidations, or drill results on any stock. For each rule, you choose the stock, alert type, specific conditions (if applicable), and notification frequency (Real-time, Daily, or Weekly). When the conditions are met, you\'ll receive a notification.',
    category: 'Alerts & Notifications'
  },
  {
    question: 'How many Alert Rules can I create?',
    answer: 'Alert rule limits vary by subscription tier: Free accounts can create up to 5 rules, Pro accounts up to 25 rules, and Premium accounts up to 100 rules. Each rule can monitor one stock for one type of event. You can enable, disable, edit, or delete rules at any time from the Alerts page.',
    category: 'Alerts & Notifications'
  },
  {
    question: 'What subscription tiers are available?',
    answer: 'VETTR offers three subscription tiers: Free (basic access with limited watchlist and alerts), Pro (expanded limits, priority data updates, and advanced features), and Premium (unlimited watchlist, maximum alerts, exclusive research, and priority support). You can view your current tier and compare plans in your Profile under the Subscription section.',
    category: 'Subscription & Features'
  },
  {
    question: 'What types of filings does VETTR track?',
    answer: 'VETTR tracks all regulatory filings from Canadian small-cap companies, including MD&A (Management Discussion & Analysis), Financial Statements, Press Releases, Material Change Reports, and other regulatory disclosures. Filings are classified by type and flagged as "material" when they contain information significant enough to influence investment decisions. Each filing includes a summary and key details.',
    category: 'Filings & Data'
  },
  {
    question: 'How fresh is the data on VETTR?',
    answer: 'VETTR continuously monitors regulatory sources and updates data in near real-time. New filings typically appear within minutes of publication. Stock prices are updated throughout trading hours. VETTR Scores and Red Flags are recalculated automatically when new data arrives. The last refresh timestamp is displayed on the Pulse page and other key views.',
    category: 'Filings & Data'
  },
  {
    question: 'Can I search for specific stocks or filings?',
    answer: 'Yes, VETTR provides multiple search options. Use the search bar on the Discovery page to find stocks by ticker, company name, or sector. The Stocks page has a search and filter system for browsing the full stock list. For power users, press Cmd+K (Mac) or Ctrl+K (Windows) anywhere in the app to open the Quick Search overlay for rapid stock lookup.',
    category: 'Using VETTR'
  },
  {
    question: 'How do I share a stock or filing with someone?',
    answer: 'Click the Share button on any stock detail page, executive profile, filing detail, or alert to generate a formatted summary. On devices with Web Share support, you can share directly to other apps. Otherwise, the summary is copied to your clipboard with a confirmation message. Shared content includes key metrics and a description.',
    category: 'Using VETTR'
  },
  {
    question: 'Is VETTR available as a mobile app?',
    answer: 'VETTR is a Progressive Web App (PWA) that works seamlessly on all devices. On mobile devices, you can "Add to Home Screen" to install it like a native app. It includes offline capability, so you can access previously loaded data even without an internet connection. The interface automatically adapts to your screen size for an optimal experience.',
    category: 'Technical'
  },
  {
    question: 'What browsers does VETTR support?',
    answer: 'VETTR works best on modern browsers including Chrome, Safari, Firefox, and Edge. For the best experience, we recommend using the latest version of your preferred browser. Some advanced features like Web Share may not be available on older browsers, but core functionality will work on all major browsers from the past two years.',
    category: 'Technical'
  }
]

export default function FAQPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  // Filter FAQ items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqItems
    }

    const query = searchQuery.toLowerCase()
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, FAQItem[]> = {}

    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })

    return groups
  }, [filteredItems])

  const toggleQuestion = (question: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(question)) {
      newExpanded.delete(question)
    } else {
      newExpanded.add(question)
    }
    setExpandedQuestions(newExpanded)
  }

  const categories = Object.keys(groupedItems)

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white/95 dark:bg-vettr-dark border-b border-gray-200 dark:border-white/5 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/profile')}
              className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Back to Profile"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h1>
          </div>

          {/* Search */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search questions..."
            autoFocus={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Question Count */}
        <div className="mb-6 text-sm text-gray-500">
          {filteredItems.length} {filteredItems.length === 1 ? 'question' : 'questions'}
          {searchQuery.trim() && ' found'}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No questions found</h3>
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

        {/* Grouped Questions by Category */}
        {categories.map((category) => (
          <div key={category} className="mb-8">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h2>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
            </div>

            {/* Questions in this category - Accordion */}
            <div className="border-b border-gray-200 dark:border-white/5">
              {groupedItems[category].map((item) => {
                const isExpanded = expandedQuestions.has(item.question)

                return (
                  <div
                    key={item.question}
                    className="border-b border-gray-200 dark:border-white/5 last:border-b-0"
                  >
                    {/* Question Header (clickable) */}
                    <button
                      onClick={() => toggleQuestion(item.question)}
                      className="w-full text-left px-4 py-4 flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.question}
                        </h3>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <ChevronDownIcon
                        className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 mt-0.5 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Answer (expandable) */}
                    {isExpanded && (
                      <div className="px-4 pb-4 animate-in fade-in duration-200">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.answer}
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
