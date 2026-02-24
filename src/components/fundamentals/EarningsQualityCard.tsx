'use client';

import { useEffect, useState } from 'react';
import { EarningsQuality } from '@/types/fundamentals';
import { getScoreColor } from '@/lib/chart-theme';
import { Sparkline } from '@/components/ui/Sparkline';

interface EarningsQualityCardProps {
  data: EarningsQuality;
}

export function EarningsQualityCard({ data }: EarningsQualityCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedMetrics, setAnimatedMetrics] = useState({
    cashConversion: 0,
    accrualsRatio: 0,
    revenueToReceivables: 0,
  });

  // Animate score on mount
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1000; // 1s

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(easeOut * data.overallScore);

      setAnimatedScore(currentScore);
      setAnimatedMetrics({
        cashConversion: easeOut * data.cashConversion,
        accrualsRatio: easeOut * data.accrualsRatio,
        revenueToReceivables: easeOut * data.revenueToReceivables,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [data.overallScore, data.cashConversion, data.accrualsRatio, data.revenueToReceivables]);

  // Get color for cash conversion (green >1.0, yellow 0.7-1.0, red <0.7)
  const getCashConversionColor = (value: number): string => {
    if (value >= 1.0) return '#10b981'; // emerald-500
    if (value >= 0.7) return '#FBBF24'; // yellow-400
    return '#F87171'; // red-400
  };

  // Get color for accruals ratio (green <0.05, yellow 0.05-0.10, red >0.10)
  const getAccrualsColor = (value: number): string => {
    if (value < 0.05) return '#10b981'; // emerald-500
    if (value <= 0.10) return '#FBBF24'; // yellow-400
    return '#F87171'; // red-400
  };

  // Get color for revenue quality (green >1.2, yellow 0.8-1.2, red <0.8)
  const getRevenueQualityColor = (value: number): string => {
    if (value >= 1.2) return '#10b981'; // emerald-500
    if (value >= 0.8) return '#FBBF24'; // yellow-400
    return '#F87171'; // red-400
  };

  // Normalize metric values for bar width (0-100%)
  const normalizeCashConversion = Math.min((data.cashConversion / 2.0) * 100, 100);
  const normalizeAccruals = Math.min((1 - data.accrualsRatio * 5) * 100, 100); // Inverted since lower is better
  const normalizeRevenueQuality = Math.min((data.revenueToReceivables / 2.0) * 100, 100);

  // EQ Score badge SVG (reusing VetrScoreBadge pattern)
  const scoreColor = getScoreColor(data.overallScore);
  const badgeSize = 80;
  const strokeWidth = 5;
  const center = badgeSize / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all duration-300">
      {/* Header */}
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-vettr-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Earnings Quality
      </h3>

      {/* EQ Score Badge */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative inline-flex items-center justify-center" style={{ width: badgeSize, height: badgeSize }} role="img" aria-label={`Earnings Quality Score: ${animatedScore} out of 100`}>
          <svg width={badgeSize} height={badgeSize} className="transform -rotate-90">
            {/* Track ring (background) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={strokeWidth}
            />

            {/* Progress ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Score number centered */}
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white tabular-nums">
            {animatedScore}
          </div>
        </div>
        <div className="flex flex-col items-center mt-2 gap-1">
          <span className="text-sm text-gray-400 font-medium">EQ Score</span>
          {data.eqScoreHistory && data.eqScoreHistory.length > 0 && (
            <Sparkline
              data={data.eqScoreHistory}
              width={60}
              height={20}
              className="opacity-70 hidden min-[375px]:block"
            />
          )}
        </div>
      </div>

      {/* Quality Metrics Bars */}
      <div className="space-y-4 mb-6">
        {/* Cash Conversion */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Cash Conversion</span>
            <span className="text-sm font-semibold text-white">{data.cashConversion.toFixed(2)}x</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${normalizeCashConversion}%`,
                backgroundColor: getCashConversionColor(data.cashConversion),
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Operating Cash Flow / Net Income</p>
        </div>

        {/* Accruals Ratio */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Accruals Ratio</span>
            <span className="text-sm font-semibold text-white">{data.accrualsRatio.toFixed(3)}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${normalizeAccruals}%`,
                backgroundColor: getAccrualsColor(data.accrualsRatio),
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Lower is better (less earnings manipulation)</p>
        </div>

        {/* Revenue Quality */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Revenue Quality</span>
            <span className="text-sm font-semibold text-white">{data.revenueToReceivables.toFixed(2)}x</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${normalizeRevenueQuality}%`,
                backgroundColor: getRevenueQualityColor(data.revenueToReceivables),
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Revenue / Receivables trend</p>
        </div>
      </div>

      {/* Consecutive Beats/Misses Badge */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Earnings Streak</span>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              data.consecutiveBeats > 0
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'bg-red-400/10 text-red-400'
            }`}
          >
            {data.consecutiveBeats > 0 ? (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{data.consecutiveBeats} Consecutive Beats</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{Math.abs(data.consecutiveBeats)} Consecutive Misses</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Earnings Surprise History Table */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Earnings Surprise History</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left">
                  Quarter
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right">
                  Actual
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right">
                  Estimate
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right">
                  Surprise
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-center">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {data.surpriseHistory.slice(0, 4).map((item, index) => {
                const isBeat = item.surprise > 0;
                return (
                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-3 py-3 text-sm text-gray-300">{item.quarter}</td>
                    <td className="px-3 py-3 text-sm text-white text-right font-medium tabular-nums">
                      ${item.epsActual.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-400 text-right tabular-nums">
                      ${item.epsEstimate.toFixed(2)}
                    </td>
                    <td
                      className={`px-3 py-3 text-sm text-right font-medium tabular-nums ${
                        isBeat ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isBeat ? '+' : ''}
                      {item.surprisePercent.toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-center">
                      {isBeat ? (
                        <svg className="w-4 h-4 text-emerald-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
