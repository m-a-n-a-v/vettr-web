'use client';

import { VetrScore } from '@/types/api';

interface VetrScoreDetailProps {
  score: VetrScore;
  onClose: () => void;
}

export default function VetrScoreDetail({ score, onClose }: VetrScoreDetailProps) {
  // Get color based on score value
  const getScoreColor = (value: number): string => {
    if (value >= 80) return 'text-accent';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-warning';
    return 'text-error';
  };

  // Get background color for bars
  const getBarColor = (value: number): string => {
    if (value >= 80) return 'bg-accent';
    if (value >= 60) return 'bg-yellow-400';
    if (value >= 40) return 'bg-warning';
    return 'bg-error';
  };

  // Component data with labels
  const components = [
    { key: 'pedigree', label: 'Pedigree', value: score.components.pedigree },
    { key: 'filing_velocity', label: 'Filing Velocity', value: score.components.filing_velocity },
    { key: 'red_flag', label: 'Red Flag', value: score.components.red_flag },
    { key: 'growth', label: 'Growth', value: score.components.growth },
    { key: 'governance', label: 'Governance', value: score.components.governance },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-primaryLight rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primaryLight border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-textPrimary">VETTR Score Breakdown</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6 text-textSecondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Score */}
          <div className="text-center pb-6 border-b border-border">
            <p className="text-textSecondary text-sm mb-2">Overall VETTR Score</p>
            <p className={`text-6xl font-bold ${getScoreColor(score.overall_score)}`}>
              {score.overall_score}
            </p>
            <p className="text-textMuted text-sm mt-2">out of 100</p>
          </div>

          {/* Component Scores */}
          <div>
            <h3 className="text-lg font-bold text-textPrimary mb-4">Component Scores</h3>
            <div className="space-y-4">
              {components.map((component) => (
                <div key={component.key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-textPrimary font-medium">{component.label}</span>
                    <span className={`font-bold ${getScoreColor(component.value)}`}>
                      {component.value}
                    </span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(component.value)} transition-all duration-500`}
                      style={{ width: `${component.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus & Penalty Points */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
              <p className="text-textSecondary text-sm mb-1">Bonus Points</p>
              <p className="text-accent text-2xl font-bold">+{score.bonus_points}</p>
            </div>
            <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-center">
              <p className="text-textSecondary text-sm mb-1">Penalty Points</p>
              <p className="text-error text-2xl font-bold">-{score.penalty_points}</p>
            </div>
          </div>

          {/* Scoring Methodology */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-bold text-textPrimary mb-3">Scoring Methodology</h3>
            <div className="space-y-3 text-textSecondary text-sm">
              <div>
                <p className="font-semibold text-textPrimary mb-1">🎓 Pedigree</p>
                <p>Evaluates the executive team&apos;s experience, tenure, and stability. Higher scores indicate a strong, experienced leadership team.</p>
              </div>
              <div>
                <p className="font-semibold text-textPrimary mb-1">📄 Filing Velocity</p>
                <p>Measures the frequency and consistency of regulatory filings. Regular filings demonstrate transparency and compliance.</p>
              </div>
              <div>
                <p className="font-semibold text-textPrimary mb-1">🚩 Red Flag</p>
                <p>Assesses potential risk indicators including consolidation patterns, financing activities, and disclosure gaps.</p>
              </div>
              <div>
                <p className="font-semibold text-textPrimary mb-1">📈 Growth</p>
                <p>Analyzes company growth metrics and financial performance trends over time.</p>
              </div>
              <div>
                <p className="font-semibold text-textPrimary mb-1">⚖️ Governance</p>
                <p>Evaluates corporate governance practices, board structure, and shareholder protections.</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-surface/50 rounded-lg">
              <p className="text-textMuted text-xs">
                <strong>Note:</strong> The overall VETTR Score is calculated from the sum of component scores, with bonus points added for positive factors and penalty points deducted for negative indicators. Scores range from 0-100, with higher scores indicating lower risk and stronger fundamentals.
              </p>
            </div>
          </div>

          {/* Color Legend */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-bold text-textPrimary mb-3">Score Ratings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-accent" />
                <span className="text-textSecondary text-sm">Excellent (80+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400" />
                <span className="text-textSecondary text-sm">Good (60-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-warning" />
                <span className="text-textSecondary text-sm">Fair (40-59)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-error" />
                <span className="text-textSecondary text-sm">Poor (&lt;40)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
