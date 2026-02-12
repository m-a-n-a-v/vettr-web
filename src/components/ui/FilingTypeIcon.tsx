'use client';

import { FilingType } from '@/types/api';

interface FilingTypeIconProps {
  type: FilingType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function FilingTypeIcon({
  type,
  size = 'md',
  showLabel = false
}: FilingTypeIconProps) {
  // Map filing types to icons and colors
  const getTypeConfig = (filingType: FilingType) => {
    switch (filingType) {
      case 'MD&A':
        return {
          icon: '📊',
          label: 'MD&A',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30'
        };
      case 'Press Release':
        return {
          icon: '📰',
          label: 'Press Release',
          color: 'text-accent',
          bgColor: 'bg-accent/20',
          borderColor: 'border-accent/30'
        };
      case 'Financial Statements':
        return {
          icon: '💰',
          label: 'Financial Statements',
          color: 'text-warning',
          bgColor: 'bg-warning/20',
          borderColor: 'border-warning/30'
        };
      case 'Other':
      default:
        return {
          icon: '📄',
          label: 'Other',
          color: 'text-textSecondary',
          bgColor: 'bg-surface',
          borderColor: 'border-border'
        };
    }
  };

  const config = getTypeConfig(type);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      icon: 'text-sm',
      label: 'text-xs'
    },
    md: {
      container: 'w-10 h-10',
      icon: 'text-base',
      label: 'text-sm'
    },
    lg: {
      container: 'w-14 h-14',
      icon: 'text-2xl',
      label: 'text-base'
    }
  };

  const sizes = sizeConfig[size];

  const iconElement = (
    <div
      className={`
        ${sizes.container}
        ${config.bgColor}
        ${config.color}
        border-2 ${config.borderColor}
        rounded-lg
        flex items-center justify-center
        ${sizes.icon}
      `}
      title={config.label}
    >
      {config.icon}
    </div>
  );

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        {iconElement}
        <span className={`${sizes.label} ${config.color} font-medium`}>
          {config.label}
        </span>
      </div>
    );
  }

  return iconElement;
}
