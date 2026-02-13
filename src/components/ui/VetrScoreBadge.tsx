'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

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
  animate: shouldAnimate = false
}: VetrScoreBadgeProps) {
  const [displayScore, setDisplayScore] = useState(shouldAnimate ? 0 : score);
  const count = useMotionValue(shouldAnimate ? 0 : score);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (shouldAnimate) {
      const animation = animate(count, score, {
        duration: 1.5,
        ease: 'easeOut',
      });

      const unsubscribe = rounded.on('change', (latest) => {
        setDisplayScore(latest);
      });

      return () => {
        animation.stop();
        unsubscribe();
      };
    } else {
      setDisplayScore(score);
    }
  }, [score, shouldAnimate, count, rounded]);
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return 'text-vettr-accent'; // Green for excellent
    if (score >= 60) return 'text-yellow-400'; // Yellow for good
    if (score >= 40) return 'text-orange-400'; // Orange for fair
    return 'text-red-400'; // Red for poor
  };

  const getBgColor = () => {
    if (score >= 80) return 'bg-vettr-accent/10';
    if (score >= 60) return 'bg-yellow-400/10';
    if (score >= 40) return 'bg-orange-400/10';
    return 'bg-red-400/10';
  };

  const getBorderColor = () => {
    if (score >= 80) return 'border-vettr-accent/30';
    if (score >= 60) return 'border-yellow-400/30';
    if (score >= 40) return 'border-orange-400/30';
    return 'border-red-400/30';
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8 text-xs',
      text: 'text-xs',
      label: 'text-xs'
    },
    md: {
      container: 'w-12 h-12 text-sm',
      text: 'text-sm',
      label: 'text-sm'
    },
    lg: {
      container: 'w-20 h-20 text-2xl',
      text: 'text-2xl',
      label: 'text-base'
    }
  };

  const config = sizeConfig[size];
  const colorClass = getColor();
  const bgColorClass = getBgColor();
  const borderColorClass = getBorderColor();

  const badge = (
    <motion.div
      className={`
        ${config.container}
        ${bgColorClass}
        border-2 ${borderColorClass}
        rounded-full
        flex items-center justify-center
        font-bold
        ${colorClass}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={`VETTR Score: ${score}`}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {displayScore}
    </motion.div>
  );

  if (showLabel) {
    return (
      <div className="flex flex-col items-center gap-1">
        {badge}
        <span className={`${config.label} text-gray-500 font-medium`}>
          VETTR Score
        </span>
      </div>
    );
  }

  return badge;
}
