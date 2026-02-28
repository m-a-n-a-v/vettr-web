'use client';

import { useState } from 'react';
import { VetrScore } from '@/types/api';
import { XIcon, ChevronDownIcon } from '@/components/icons';
import VetrScoreBadge from '@/components/ui/VetrScoreBadge';

interface VetrScoreDetailProps {
  score: VetrScore;
  onClose: () => void;
}

export default function VetrScoreDetail({ score, onClose }: VetrScoreDetailProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  // Get color based on score value (5-tier scale)
  const getScoreColor = (value: number): string => {
    if (value >= 90) return 'text-[#198754]'; // dark green
    if (value >= 75) return 'text-[#84CC16]'; // lime green
    if (value >= 50) return 'text-[#FBBF24]'; // yellow
    if (value >= 30) return 'text-[#F97316]'; // orange
    return 'text-[#DC2626]'; // deep red
  };

  // Pillar descriptions for methodology section
  const pillarMethodology = [
    {
      label: 'Financial Survival',
      description: 'Cash runway with FCF Rule + debt health'
    },
    {
      label: 'Operational Efficiency',
      description: 'Sector-specific operational efficiency (mining: exploration ratio, tech: R&D ratio, producer: gross margin)'
    },
    {
      label: 'Shareholder Structure',
      description: 'Executive pedigree, dilution penalty, SEDI insider conviction, warrant overhang proximity'
    },
    {
      label: 'Market Sentiment',
      description: 'Liquidity, technical momentum, news velocity, short interest risk, analyst consensus'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-vettr-card border-b border-gray-200 dark:border-white/5 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">VETTR Score Breakdown</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Score - Large SVG Ring */}
          <div className="flex flex-col items-center pb-6 border-b border-gray-200 dark:border-white/5">
            <VetrScoreBadge score={score.overall_score} size="lg" showLabel />
            <p className="text-gray-500 text-xs mt-2">out of 100</p>
          </div>

          {/* Component Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Component Breakdown</h3>
            <div className="space-y-6">
              {/* Dynamically render pillars with null safety */}
              {[
                {
                  label: 'Financial Survival',
                  pillar: score.financial_survival,
                  color: 'bg-blue-400',
                  subScores: score.financial_survival ? [
                    { label: 'Cash Runway', value: score.financial_survival.sub_scores?.cash_runway },
                    { label: 'Solvency', value: score.financial_survival.sub_scores?.solvency },
                  ] : [],
                },
                {
                  label: 'Operational Efficiency',
                  pillar: score.operational_efficiency,
                  color: 'bg-purple-400',
                  subScores: score.operational_efficiency ? [
                    { label: 'Efficiency Ratio', value: score.operational_efficiency.sub_scores?.efficiency_ratio },
                  ] : [],
                },
                {
                  label: 'Shareholder Structure',
                  pillar: score.shareholder_structure,
                  color: 'bg-vettr-accent',
                  subScores: score.shareholder_structure ? [
                    { label: 'Pedigree', value: score.shareholder_structure.sub_scores?.pedigree },
                    { label: 'Dilution Penalty', value: score.shareholder_structure.sub_scores?.dilution_penalty },
                    { label: 'SEDI Insider Conviction', value: score.shareholder_structure.sub_scores?.sedi_insider_conviction },
                    { label: 'Warrant Overhang', value: score.shareholder_structure.sub_scores?.warrant_overhang },
                  ] : [],
                },
                {
                  label: 'Market Sentiment',
                  pillar: score.market_sentiment,
                  color: 'bg-yellow-400',
                  subScores: score.market_sentiment ? [
                    { label: 'Liquidity', value: score.market_sentiment.sub_scores?.liquidity },
                    { label: 'News Velocity', value: score.market_sentiment.sub_scores?.news_velocity },
                    { label: 'Technical Momentum', value: score.market_sentiment.sub_scores?.technical_momentum },
                    { label: 'Short Squeeze', value: score.market_sentiment.sub_scores?.short_squeeze },
                    { label: 'Analyst Consensus', value: score.market_sentiment.sub_scores?.analyst_consensus },
                  ] : [],
                },
              ].map(({ label, pillar, color, subScores }) => {
                if (!pillar) return null;
                return (
                  <div key={label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white font-medium">{label}</span>
                        {pillar.weight != null && (
                          <span className="text-xs text-gray-500">(weight: {pillar.weight}%)</span>
                        )}
                      </div>
                      <span className={`font-bold ${getScoreColor(pillar.score ?? 0)}`}>
                        {pillar.score ?? 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-2 overflow-hidden mb-3">
                      <div
                        className={`h-full ${color} transition-all duration-1000`}
                        style={{ width: `${pillar.score ?? 0}%` }}
                      />
                    </div>
                    {subScores.length > 0 && (
                      <div className="space-y-2 text-xs">
                        {subScores.map(({ label: subLabel, value }) => (
                          value != null && (
                            <div key={subLabel} className="flex justify-between text-gray-400">
                              <span>{subLabel}:</span>
                              <span className={getScoreColor(value)}>{value}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Null Pillars Notice */}
          {score.null_pillars && score.null_pillars.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-white/5">
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm font-medium mb-1">Data Availability Notice</p>
                <p className="text-gray-400 text-xs">
                  Weight redistributed due to insufficient data for: {score.null_pillars.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Scoring Methodology - Collapsible */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scoring Methodology</h3>
              <ChevronDownIcon
                className={`w-5 h-5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-all ${
                  showMethodology ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showMethodology && (
              <div className="mt-4 space-y-4 animate-in fade-in duration-200">
                {pillarMethodology.map((pillar, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{pillar.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-vettr-accent/5 border border-vettr-accent/20 rounded-xl">
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">Formula:</strong> The overall VETTR Score is calculated using a weighted average of four pillars: Financial Survival, Operational Efficiency, Shareholder Structure, and Market Sentiment. Each pillar&apos;s weight is dynamically adjusted based on data availability. When a pillar lacks sufficient data, it is marked as null and its weight is redistributed proportionally among the remaining pillars. Scores range from 0-100, with higher scores indicating lower risk and stronger fundamentals.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Score Ratings Legend - 5-tier scale */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Score Ratings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#198754' }} />
                <span className="text-gray-400 text-xs">90-100</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#84CC16' }} />
                <span className="text-gray-400 text-xs">75-89</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FBBF24' }} />
                <span className="text-gray-400 text-xs">50-74</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F97316' }} />
                <span className="text-gray-400 text-xs">30-49</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#DC2626' }} />
                <span className="text-gray-400 text-xs">0-29</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
