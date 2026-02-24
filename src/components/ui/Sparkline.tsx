'use client';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDot?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  color,
  showDot = true,
  className = ''
}: SparklineProps) {
  // Handle edge cases
  if (!data || data.length === 0) {
    return null;
  }

  // Auto-detect trend direction if color not provided
  const autoColor = color || (() => {
    const firstValue = data[0];
    const lastValue = data[data.length - 1];

    if (lastValue > firstValue) return '#00E676'; // green - trending up
    if (lastValue < firstValue) return '#F87171'; // red - trending down
    return '#64748b'; // gray - flat
  })();

  // Calculate min/max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  // Prevent division by zero
  const hasRange = range > 0;

  // Generate SVG path points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = hasRange
      ? height - ((value - min) / range) * height
      : height / 2; // center line if no range
    return `${x},${y}`;
  }).join(' ');

  // Get last point for dot
  const lastPoint = data.length > 0 ? (() => {
    const index = data.length - 1;
    const value = data[index];
    const x = (index / (data.length - 1)) * width;
    const y = hasRange
      ? height - ((value - min) / range) * height
      : height / 2;
    return { x, y };
  })() : null;

  return (
    <svg
      width={width}
      height={height}
      className={`inline-block ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Sparkline path */}
      <polyline
        points={points}
        fill="none"
        stroke={autoColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Dot on last point */}
      {showDot && lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2"
          fill={autoColor}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
