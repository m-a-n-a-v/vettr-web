'use client';

interface SectorChipProps {
  sector: string;
  size?: 'sm' | 'md';
}

export default function SectorChip({ sector, size = 'sm' }: SectorChipProps) {
  // Map sectors to colors for visual distinction
  const getSectorColor = (sectorName: string) => {
    const normalized = sectorName.toLowerCase();

    if (normalized.includes('tech') || normalized.includes('software')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
    if (normalized.includes('financ') || normalized.includes('bank')) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    if (normalized.includes('energy') || normalized.includes('oil') || normalized.includes('gas')) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    if (normalized.includes('health') || normalized.includes('pharma') || normalized.includes('bio')) {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    if (normalized.includes('mining') || normalized.includes('metal') || normalized.includes('material')) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
    if (normalized.includes('consumer') || normalized.includes('retail')) {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
    if (normalized.includes('industrial') || normalized.includes('manufactur')) {
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
    if (normalized.includes('real estate') || normalized.includes('property')) {
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
    if (normalized.includes('telecom') || normalized.includes('communication')) {
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
    if (normalized.includes('util')) {
      return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    }

    // Default neutral color
    return 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400';
  };

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 text-xs'
    : 'px-3 py-1 text-sm';

  const colorClasses = getSectorColor(sector);

  return (
    <span
      className={`
        ${sizeClasses}
        ${colorClasses}
        rounded-full
        font-medium
        inline-flex
        items-center
        whitespace-nowrap
      `}
    >
      {sector}
    </span>
  );
}
