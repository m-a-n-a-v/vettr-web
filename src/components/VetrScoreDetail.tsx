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

  // Get color based on score value
  const getScoreColor = (value: number): string => {
    if (value >= 80) return 'text-vettr-accent';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Component colors matching V2-027 acceptance criteria
  const getComponentColor = (key: string): string => {
    switch (key) {
      case 'pedigree': return 'bg-blue-400';
      case 'filing_velocity': return 'bg-purple-400';
      case 'red_flag': return 'bg-red-400';
      case 'growth': return 'bg-vettr-accent';
      case 'governance': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  // Component data with labels and descriptions
  const components = [
    {
      key: 'pedigree',
      label: 'Pedigree',
      value: score.components.pedigree,
      description: 'Executive team experience, tenure, and stability. Higher scores indicate strong, experienced leadership.'
    },
    {
      key: 'filing_velocity',
      label: 'Filing Velocity',
      value: score.components.filing_velocity,
      description: 'Frequency and consistency of regulatory filings. Regular filings demonstrate transparency and compliance.'
    },
    {
      key: 'red_flag',
      label: 'Red Flag',
      value: score.components.red_flag,
      description: 'Risk indicators including consolidation patterns, financing activities, and disclosure gaps.'
    },
    {
      key: 'growth',
      label: 'Growth',
      value: score.components.growth,
      description: 'Company growth metrics and financial performance trends over time.'
    },
    {
      key: 'governance',
      label: 'Governance',
      value: score.components.governance,
      description: 'Corporate governance practices, board structure, and shareholder protections.'
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
            <div className="space-y-4">
              {components.map((component) => (
                <div key={component.key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{component.label}</span>
                    <span className={`font-bold ${getScoreColor(component.value)}`}>
                      {component.value}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getComponentColor(component.key)} transition-all duration-1000`}
                      style={{ width: `${component.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus & Penalty Points */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Adjustments</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-vettr-accent/10 border border-vettr-accent/30 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Bonus Points</p>
                <p className="text-vettr-accent text-2xl font-bold">+{score.bonus_points}</p>
              </div>
              <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Penalty Points</p>
                <p className="text-red-400 text-2xl font-bold">-{score.penalty_points}</p>
              </div>
            </div>
          </div>

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
                {components.map((component) => (
                  <div key={component.key} className="bg-white/[0.03] rounded-xl p-4">
                    <p className="font-medium text-white mb-2">{component.label}</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{component.description}</p>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-vettr-accent/5 border border-vettr-accent/20 rounded-xl">
                  <p className="text-gray-400 text-xs leading-relaxed">
                    <strong className="text-white">Note:</strong> The overall VETTR Score is calculated from the sum of component scores, with bonus points added for positive factors and penalty points deducted for negative indicators. Scores range from 0-100, with higher scores indicating lower risk and stronger fundamentals.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Score Ratings Legend */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">Score Ratings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-vettr-accent" />
                <span className="text-gray-400 text-sm">Excellent (80+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400" />
                <span className="text-gray-400 text-sm">Good (60-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-400" />
                <span className="text-gray-400 text-sm">Fair (40-59)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-400" />
                <span className="text-gray-400 text-sm">Poor (&lt;40)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
