'use client';

interface VetrScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export default function VetrScoreBadge({
  score,
  size = 'md',
  showLabel = false,
  onClick
}: VetrScoreBadgeProps) {
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return 'text-accent'; // Green for excellent
    if (score >= 60) return 'text-yellow-500'; // Yellow for good
    if (score >= 40) return 'text-warning'; // Amber for fair
    return 'text-error'; // Red for poor
  };

  const getBgColor = () => {
    if (score >= 80) return 'bg-accent/10';
    if (score >= 60) return 'bg-yellow-500/10';
    if (score >= 40) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getBorderColor = () => {
    if (score >= 80) return 'border-accent/30';
    if (score >= 60) return 'border-yellow-500/30';
    if (score >= 40) return 'border-warning/30';
    return 'border-error/30';
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
    <div
      className={`
        ${config.container}
        ${bgColorClass}
        border-2 ${borderColorClass}
        rounded-full
        flex items-center justify-center
        font-bold
        ${colorClass}
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={`VETTR Score: ${score}`}
    >
      {score}
    </div>
  );

  if (showLabel) {
    return (
      <div className="flex flex-col items-center gap-1">
        {badge}
        <span className={`${config.label} text-textMuted font-medium`}>
          VETTR Score
        </span>
      </div>
    );
  }

  return badge;
}
