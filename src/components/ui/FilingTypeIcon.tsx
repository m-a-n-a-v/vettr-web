'use client';

import { FilingType } from '@/types/api';

interface FilingTypeIconProps {
  type: FilingType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// SVG Icons for each filing type
const FilingIcons = {
  'MD&A': ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  'Press Release': ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  'Financial Statements': ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Other: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
};

export default function FilingTypeIcon({
  type,
  size = 'md',
  showLabel = false
}: FilingTypeIconProps) {
  // Map filing types to icons and colors (V2 design tokens)
  const getTypeConfig = (filingType: FilingType) => {
    switch (filingType) {
      case 'MD&A':
        return {
          Icon: FilingIcons['MD&A'],
          label: 'MD&A',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20'
        };
      case 'Press Release':
        return {
          Icon: FilingIcons['Press Release'],
          label: 'Press Release',
          color: 'text-vettr-accent',
          bgColor: 'bg-vettr-accent/10',
          borderColor: 'border-vettr-accent/20'
        };
      case 'Financial Statements':
        return {
          Icon: FilingIcons['Financial Statements'],
          label: 'Financial Statements',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        };
      case 'Other':
      default:
        return {
          Icon: FilingIcons.Other,
          label: 'Other',
          color: 'text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-white/5',
          borderColor: 'border-gray-200 dark:border-white/10'
        };
    }
  };

  const config = getTypeConfig(type);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      label: 'text-xs'
    },
    md: {
      container: 'w-10 h-10',
      icon: 'w-5 h-5',
      label: 'text-sm'
    },
    lg: {
      container: 'w-14 h-14',
      icon: 'w-7 h-7',
      label: 'text-base'
    }
  };

  const sizes = sizeConfig[size];
  const Icon = config.Icon;

  const iconElement = (
    <div
      className={`
        ${sizes.container}
        ${config.bgColor}
        ${config.color}
        border ${config.borderColor}
        rounded-lg
        flex items-center justify-center
      `}
      title={config.label}
    >
      <Icon className={sizes.icon} />
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
