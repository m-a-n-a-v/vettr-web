'use client'

import { SamplePortfolio } from '@/types/api'

interface SamplePortfolioPickerProps {
  portfolios: SamplePortfolio[]
  isLoading: boolean
  onSelect: (id: string) => void
}

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export default function SamplePortfolioPicker({
  portfolios,
  isLoading,
  onSelect,
}: SamplePortfolioPickerProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-7 w-64 bg-gray-200 dark:bg-white/10 rounded-lg mx-auto animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-white/5 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 h-44 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (portfolios.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Choose a Sample Portfolio
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Explore VETTR&apos;s Pulse dashboard with a themed sample portfolio. This selection is permanent — connect your real portfolio anytime to replace it.
        </p>
      </div>

      {/* Portfolio Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => (
          <button
            key={portfolio.id}
            onClick={() => onSelect(portfolio.id)}
            className="group text-left bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:border-vettr-accent/40 hover:bg-vettr-accent/5 dark:hover:bg-vettr-accent/5 transition-all duration-200"
          >
            {/* Icon + Name */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{portfolio.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-vettr-accent transition-colors">
                  {portfolio.name}
                </h3>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {portfolio.tagline}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Stocks</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {portfolio.stock_count}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Notional Value</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(portfolio.total_notional_value)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
