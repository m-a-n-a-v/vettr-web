'use client';

import type { PortfolioSnapshot } from '@/types/portfolio';

interface ValueChartProps {
  snapshots: PortfolioSnapshot[];
  height?: number;
}

export default function ValueChart({ snapshots, height = 120 }: ValueChartProps) {
  if (snapshots.length < 2) {
    return (
      <div className="flex items-center justify-center text-xs text-gray-400" style={{ height }}>
        Not enough data for chart
      </div>
    );
  }

  const values = snapshots.map(s => s.totalValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const isPositive = values[values.length - 1] >= values[0];
  const strokeColor = isPositive ? '#00E676' : '#EF4444';

  // Generate SVG path
  const width = 400;
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((v - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;

  // Area path
  const areaPath = `${linePath} L${padding + chartWidth},${padding + chartHeight} L${padding},${padding + chartHeight} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
      />
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
