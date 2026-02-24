'use client';

import { ShortInterest } from '@/types/fundamentals';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ShortInterestSectionProps {
  shortInterest: ShortInterest;
}

/**
 * Get color class based on short interest percentage
 * Green <3%, Yellow 3-10%, Red >10%
 */
function getShortInterestColor(percent: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (percent < 3) {
    return {
      bg: 'bg-emerald-400/10',
      text: 'text-emerald-400',
      border: 'border-emerald-400/20',
    };
  } else if (percent <= 10) {
    return {
      bg: 'bg-yellow-400/10',
      text: 'text-yellow-400',
      border: 'border-yellow-400/20',
    };
  } else {
    return {
      bg: 'bg-red-400/10',
      text: 'text-red-400',
      border: 'border-red-400/20',
    };
  }
}

/**
 * Get squeeze potential badge color and pulse animation
 */
function getSqueezePotentialStyles(potential: 'high' | 'moderate' | 'low'): {
  bg: string;
  text: string;
  border: string;
  pulse: boolean;
} {
  if (potential === 'high') {
    return {
      bg: 'bg-emerald-400/10',
      text: 'text-emerald-400',
      border: 'border-emerald-400/20',
      pulse: true,
    };
  } else if (potential === 'moderate') {
    return {
      bg: 'bg-yellow-400/10',
      text: 'text-yellow-400',
      border: 'border-yellow-400/20',
      pulse: false,
    };
  } else {
    return {
      bg: 'bg-gray-100 dark:bg-white/5',
      text: 'text-gray-500 dark:text-gray-400',
      border: 'border-gray-200 dark:border-white/5',
      pulse: false,
    };
  }
}

/**
 * ShortInterestSection Component
 * Comprehensive short interest display with historical trend and squeeze potential
 */
export function ShortInterestSection({ shortInterest }: ShortInterestSectionProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = getShortInterestColor(shortInterest.shortInterestPercent);
  const squeezeStyles = getSqueezePotentialStyles(shortInterest.squeezePotential);

  // Format chart data for Recharts
  const chartData = shortInterest.shortInterestHistory.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    percent: item.shortInterestPercent,
  }));

  // Determine if change is positive or negative (rising SI = more bearish = red, declining SI = less bearish = green)
  const isDecreasing = shortInterest.shortInterestChange < 0;
  const changeColor = isDecreasing ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="bg-white/50 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-gray-50 dark:hover:bg-vettr-card/80 transition-all duration-300">
      {/* Header with main badge */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-300 hover:border-vettr-accent/40 cursor-help`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          tabIndex={0}
          role="button"
          aria-label={`Short Interest: ${shortInterest.shortInterestPercent.toFixed(2)}% with ${shortInterest.daysToCover.toFixed(1)} days to cover`}
        >
          {/* Info icon */}
          <svg
            className={`w-4 h-4 ${colors.text}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>

          {/* Short Interest Label */}
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Short Interest
          </span>

          {/* Short Interest Value */}
          <span className={`text-sm font-semibold ${colors.text}`}>
            {shortInterest.shortInterestPercent.toFixed(2)}%
          </span>

          {/* Days to Cover */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({shortInterest.daysToCover.toFixed(1)} days)
          </span>
        </div>

        {/* Squeeze Potential Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${squeezeStyles.bg} ${squeezeStyles.border} ${
            squeezeStyles.pulse ? 'animate-pulse' : ''
          }`}
        >
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Squeeze Potential
          </span>
          <span className={`text-sm font-semibold ${squeezeStyles.text} capitalize`}>
            {shortInterest.squeezePotential}
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 w-64 p-3 bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-lg shadow-lg -mt-2">
          <div className="text-xs text-gray-900 dark:text-white font-semibold mb-1">
            What is Short Interest?
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Short interest shows the percentage of shares being bet against. Higher percentages indicate more bearish sentiment. Days to cover shows how many days it would take to close all short positions.
          </div>
          <div className="text-xs text-gray-500 mt-2">
            As of {new Date(shortInterest.asOfDate).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* 1-Month Change */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
            1-Month Change
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${changeColor}`}>
              {shortInterest.shortInterestChange > 0 ? '+' : ''}
              {shortInterest.shortInterestChange.toFixed(2)}%
            </span>
            {/* Arrow indicator */}
            <svg
              className={`w-4 h-4 ${changeColor} ${isDecreasing ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isDecreasing ? 'Shorts covering (less bearish)' : 'Shorts increasing (more bearish)'}
          </div>
        </div>

        {/* Squeeze Potential Explanation */}
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
            Squeeze Criteria
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {shortInterest.squeezePotential === 'high' && (
              <>High short interest (&gt;8%), declining trend, and/or high days to cover (&gt;5) indicate strong squeeze potential.</>
            )}
            {shortInterest.squeezePotential === 'moderate' && (
              <>Moderate short interest or some favorable conditions for a potential squeeze.</>
            )}
            {shortInterest.squeezePotential === 'low' && (
              <>Low short interest (&lt;8%) and/or unfavorable conditions make squeeze unlikely.</>
            )}
          </div>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="mt-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          6-Month Short Interest Trend
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="shortInterestGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={
                    shortInterest.shortInterestPercent > 10
                      ? '#F87171'
                      : shortInterest.shortInterestPercent > 3
                      ? '#FBBF24'
                      : '#00E676'
                  }
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={
                    shortInterest.shortInterestPercent > 10
                      ? '#F87171'
                      : shortInterest.shortInterestPercent > 3
                      ? '#FBBF24'
                      : '#00E676'
                  }
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: '#6B7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 'auto']}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E3348',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: number | undefined) =>
                value !== undefined ? [`${value.toFixed(2)}%`, 'Short Interest'] : ['N/A', 'Short Interest']
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="percent"
              stroke={
                shortInterest.shortInterestPercent > 10
                  ? '#F87171'
                  : shortInterest.shortInterestPercent > 3
                  ? '#FBBF24'
                  : '#00E676'
              }
              strokeWidth={2}
              fill="url(#shortInterestGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
