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
    if (value >= 90) return 'text-[#166534]'; // dark green
    if (value >= 75) return 'text-vettr-accent'; // green
    if (value >= 50) return 'text-[#FBBF24]'; // yellow
    if (value >= 30) return 'text-[#FB923C]'; // orange
    return 'text-[#F87171]'; // red
  };

  // Pillar descriptions for methodology section
  const pillarMethodology = [
    {
      label: 'Financial Survival',
      description: 'Measures cash runway and solvency. Higher scores indicate stronger financial stability and ability to sustain operations. Combines cash position analysis with debt coverage metrics.'
    },
    {
      label: 'Operational Efficiency',
      description: 'Evaluates how efficiently the company operates relative to revenue and expenses. Analyzes operational efficiency ratios to assess management effectiveness.'
    },
    {
      label: 'Shareholder Structure',
      description: 'Assesses pedigree, dilution patterns, and insider alignment. Higher scores indicate better shareholder protection and institutional confidence. Includes investor quality and ownership stability.'
    },
    {
      label: 'Market Sentiment',
      description: 'Measures market liquidity and news velocity. Reflects market confidence and trading activity. Combines liquidity metrics with news sentiment analysis.'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-vettr-card border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-vettr-card border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">VETTR Score Breakdown</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Score - Large SVG Ring */}
          <div className="flex flex-col items-center pb-6 border-b border-white/5">
            <VetrScoreBadge score={score.overall_score} size="lg" showLabel />
            <p className="text-gray-500 text-xs mt-2">out of 100</p>
          </div>

          {/* Component Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Component Breakdown</h3>
            <div className="space-y-6">
              {/* Financial Survival */}
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Financial Survival</span>
                    <span className="text-xs text-gray-500">(weight: {score.financial_survival.weight}%)</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.financial_survival.score)}`}>
                    {score.financial_survival.score}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full bg-blue-400 transition-all duration-1000"
                    style={{ width: `${score.financial_survival.score}%` }}
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Cash Runway:</span>
                    <span className={getScoreColor(score.financial_survival.sub_scores.cash_runway)}>
                      {score.financial_survival.sub_scores.cash_runway}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Solvency:</span>
                    <span className={getScoreColor(score.financial_survival.sub_scores.solvency)}>
                      {score.financial_survival.sub_scores.solvency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Efficiency */}
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Operational Efficiency</span>
                    <span className="text-xs text-gray-500">(weight: {score.operational_efficiency.weight}%)</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.operational_efficiency.score)}`}>
                    {score.operational_efficiency.score}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full bg-purple-400 transition-all duration-1000"
                    style={{ width: `${score.operational_efficiency.score}%` }}
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Efficiency Ratio:</span>
                    <span className={getScoreColor(score.operational_efficiency.sub_scores.efficiency_ratio)}>
                      {score.operational_efficiency.sub_scores.efficiency_ratio}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shareholder Structure */}
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Shareholder Structure</span>
                    <span className="text-xs text-gray-500">(weight: {score.shareholder_structure.weight}%)</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.shareholder_structure.score)}`}>
                    {score.shareholder_structure.score}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full bg-vettr-accent transition-all duration-1000"
                    style={{ width: `${score.shareholder_structure.score}%` }}
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Pedigree:</span>
                    <span className={getScoreColor(score.shareholder_structure.sub_scores.pedigree)}>
                      {score.shareholder_structure.sub_scores.pedigree}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Dilution Penalty:</span>
                    <span className={getScoreColor(score.shareholder_structure.sub_scores.dilution_penalty)}>
                      {score.shareholder_structure.sub_scores.dilution_penalty}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Insider Alignment:</span>
                    <span className={getScoreColor(score.shareholder_structure.sub_scores.insider_alignment)}>
                      {score.shareholder_structure.sub_scores.insider_alignment}
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Sentiment */}
              <div className="bg-white/[0.03] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Market Sentiment</span>
                    <span className="text-xs text-gray-500">(weight: {score.market_sentiment.weight}%)</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score.market_sentiment.score)}`}>
                    {score.market_sentiment.score}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-1000"
                    style={{ width: `${score.market_sentiment.score}%` }}
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Liquidity:</span>
                    <span className={getScoreColor(score.market_sentiment.sub_scores.liquidity)}>
                      {score.market_sentiment.sub_scores.liquidity}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>News Velocity:</span>
                    <span className={getScoreColor(score.market_sentiment.sub_scores.news_velocity)}>
                      {score.market_sentiment.sub_scores.news_velocity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Null Pillars Notice */}
          {score.null_pillars && score.null_pillars.length > 0 && (
            <div className="pt-4 border-t border-white/5">
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
              <h3 className="text-lg font-semibold text-white">Scoring Methodology</h3>
              <ChevronDownIcon
                className={`w-5 h-5 text-gray-400 group-hover:text-white transition-all ${
                  showMethodology ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showMethodology && (
              <div className="mt-4 space-y-4 animate-in fade-in duration-200">
                {pillarMethodology.map((pillar, index) => (
                  <div key={index} className="bg-white/[0.03] rounded-xl p-4">
                    <p className="font-medium text-white mb-2">{pillar.label}</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-vettr-accent/5 border border-vettr-accent/20 rounded-xl">
                  <p className="text-gray-400 text-xs leading-relaxed">
                    <strong className="text-white">Formula:</strong> The overall VETTR Score is calculated using a weighted average of four pillars: Financial Survival, Operational Efficiency, Shareholder Structure, and Market Sentiment. Each pillar&apos;s weight is dynamically adjusted based on data availability. When a pillar lacks sufficient data, it is marked as null and its weight is redistributed proportionally among the remaining pillars. Scores range from 0-100, with higher scores indicating lower risk and stronger fundamentals.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Score Ratings Legend - 5-tier scale */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Score Ratings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#166534' }} />
                <span className="text-gray-400 text-xs">90-100</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-vettr-accent" />
                <span className="text-gray-400 text-xs">75-89</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FBBF24' }} />
                <span className="text-gray-400 text-xs">50-74</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FB923C' }} />
                <span className="text-gray-400 text-xs">30-49</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F87171' }} />
                <span className="text-gray-400 text-xs">0-29</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
