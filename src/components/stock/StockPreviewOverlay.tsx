'use client'

import Link from 'next/link'
import type { StockPreview } from '@/types/api'
import VetrScoreBadge from '@/components/ui/VetrScoreBadge'
import SectorChip from '@/components/ui/SectorChip'
import PriceChangeIndicator from '@/components/ui/PriceChangeIndicator'

interface StockPreviewOverlayProps {
  preview: StockPreview
}

const PILLAR_LABELS: Record<string, string> = {
  financial_survival: 'Financial Survival',
  operational_efficiency: 'Operational Efficiency',
  shareholder_structure: 'Shareholder Structure',
  market_sentiment: 'Market Sentiment',
}

const PILLAR_ORDER = ['financial_survival', 'operational_efficiency', 'shareholder_structure', 'market_sentiment'] as const

function getBarColor(score: number): string {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-500'
  if (score >= 30) return 'bg-orange-500'
  return 'bg-red-500'
}

function formatMarketCap(value: number | null): string {
  if (!value) return 'N/A'
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export default function StockPreviewOverlay({ preview }: StockPreviewOverlayProps) {
  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-vettr-accent transition-colors">
          &larr; Back to Search
        </Link>
      </div>

      {/* Stock Header — Visible */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{preview.ticker}</h1>
              <span className="text-xs text-gray-500 uppercase bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">{preview.exchange}</span>
              {preview.sector && <SectorChip sector={preview.sector} />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{preview.company_name}</p>
          </div>
          <div className="flex-shrink-0">
            <VetrScoreBadge score={preview.vetr_score ?? 0} size="lg" />
          </div>
        </div>

        {/* Price info */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {preview.current_price ? `$${preview.current_price.toFixed(2)}` : 'N/A'}
          </span>
          {preview.price_change_percent != null && (
            <PriceChangeIndicator change={preview.price_change_percent} />
          )}
          <span className="text-sm text-gray-400">
            Mkt Cap: {formatMarketCap(preview.market_cap)}
          </span>
        </div>
      </div>

      {/* VETTR Score Pillar Breakdown — Visible */}
      <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">VETTR Score Breakdown</h2>
        {preview.pillars ? (
          <div className="space-y-4">
            {PILLAR_ORDER.map((key) => {
              const pillar = preview.pillars![key]
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{PILLAR_LABELS[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">({Math.round(pillar.weight * 100)}%)</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{pillar.score}</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getBarColor(pillar.score)}`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {preview.null_pillars.length > 0 && (
              <p className="text-[10px] text-gray-400 mt-2">
                * Insufficient data for: {preview.null_pillars.join(', ')}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Score breakdown not available for this stock.</p>
        )}
      </div>

      {/* Blurred Content with CTA Overlay */}
      <div className="relative">
        {/* Placeholder blurred content */}
        <div className="blur-md pointer-events-none select-none" aria-hidden="true">
          {/* Fake tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-white/10 pb-3">
            {['Overview', 'Fundamentals', 'Pedigree', 'Red Flags'].map((tab) => (
              <span key={tab} className="text-sm font-medium text-gray-400 pb-1">{tab}</span>
            ))}
          </div>

          {/* Fake metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {['Cash Runway', 'Insider Ownership', 'Solvency Ratio', 'Dilution Risk'].map((label) => (
              <div key={label} className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">██.██</p>
                <p className="text-xs text-gray-400 mt-0.5">████ ██████</p>
              </div>
            ))}
          </div>

          {/* Fake filings section */}
          <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 mb-6">
            <p className="text-sm font-semibold text-gray-500 mb-3">Recent Filings</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-white/5">
                <div>
                  <p className="text-sm text-gray-500">████████ ██ ████████</p>
                  <p className="text-xs text-gray-400">███ ██, ████</p>
                </div>
                <span className="text-xs text-gray-400">██████</span>
              </div>
            ))}
          </div>

          {/* Fake executives section */}
          <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-500 mb-3">Executive Pedigree</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-t border-gray-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/5" />
                <div>
                  <p className="text-sm text-gray-500">████ ████████</p>
                  <p className="text-xs text-gray-400">████ ████████ ██████</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-white/80 dark:via-vettr-navy/80 to-white dark:to-vettr-navy">
          <div className="bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4">
            {/* Lock icon */}
            <div className="w-14 h-14 rounded-2xl bg-vettr-accent/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-vettr-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Unlock the Full Due Diligence Report
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              See insider transactions, cash runway analysis, executive pedigree, and red flags for <span className="font-semibold text-gray-700 dark:text-gray-300">{preview.ticker}</span>.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/signup"
                className="w-full px-6 py-3 bg-vettr-accent text-vettr-navy text-sm font-bold rounded-xl hover:bg-vettr-accent/90 transition-colors"
              >
                Create a Free Account
              </Link>
              <Link
                href="/login"
                className="text-sm text-gray-500 hover:text-vettr-accent transition-colors"
              >
                Already have an account? <span className="font-semibold">Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
