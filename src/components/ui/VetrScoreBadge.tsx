'use client';

import { useEffect, useState } from 'react';

interface VetrScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export default function VetrScoreBadge({
  score,
  size = 'md',
  showLabel = false,
  onClick,
  animate: shouldAnimate = true
}: VetrScoreBadgeProps) {
  const [animatedScore, setAnimatedScore] = useState(shouldAnimate ? 0 : score);

  useEffect(() => {
    if (shouldAnimate) {
      // Animate from 0 to score over 1s
      const startTime = Date.now();
      const duration = 1000; // 1s

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(easeOut * score);

        setAnimatedScore(currentScore);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setAnimatedScore(score);
    }
  }, [score, shouldAnimate]);

  // Determine stroke color based on score (using Tailwind theme colors)
  const getStrokeColor = (): string => {
    if (score >= 80) return '#00E676'; // vettr-accent
    if (score >= 60) return '#FBBF24'; // yellow-400
    if (score >= 40) return '#FB923C'; // orange-400
    return '#F87171'; // red-400
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      size: 32,
      strokeWidth: 2,
      fontSize: 'text-xs',
      labelSize: 'text-xs'
    },
    md: {
      size: 48,
      strokeWidth: 3,
      fontSize: 'text-sm',
      labelSize: 'text-sm'
    },
    lg: {
      size: 64,
      strokeWidth: 4,
      fontSize: 'text-xl',
      labelSize: 'text-base'
    }
  };

  const config = sizeConfig[size];
  const strokeColor = getStrokeColor();

  // SVG circle calculations
  const center = config.size / 2;
  const radius = center - config.strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const badge = (
    <div
      className={`relative inline-flex items-center justify-center ${onClick ? 'cursor-pointer group' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={`VETTR Score: ${score}`}
      style={{ width: config.size, height: config.size }}
    >
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Track ring (background) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={config.strokeWidth}
        />

        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Score number centered */}
      <div className={`absolute inset-0 flex items-center justify-center ${config.fontSize} font-bold text-white tabular-nums`}>
        {animatedScore}
      </div>
    </div>
  );

  if (showLabel) {
    return (
      <div className="flex flex-col items-center gap-2">
        {badge}
        <span className={`${config.labelSize} text-gray-500 font-medium`}>
          VETTR Score
        </span>
      </div>
    );
  }

  return badge;
}
