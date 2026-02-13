/**
 * Chart theme configuration for Recharts components
 * Uses Tailwind CSS theme colors for consistent styling
 */

// Import Tailwind colors from config
const colors = {
  // VETTR brand colors
  vettrAccent: '#00E676',
  vettrCard: '#1E3348',
  vettrNavy: '#0D1B2A',

  // Neutral colors
  white: '#FFFFFF',

  // Gray scale
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',

  // Status colors
  red400: '#F87171',
  yellow400: '#FBBF24',
  orange400: '#FB923C',
  blue400: '#60A5FA',
  purple400: '#C084FC',
};

// Chart theme constants
export const chartTheme = {
  // Grid lines
  grid: {
    stroke: 'rgba(255, 255, 255, 0.05)',
    strokeDasharray: '3 3',
  },

  // Axes
  axis: {
    stroke: 'rgba(255, 255, 255, 0.2)',
    tick: {
      fill: colors.gray400,
      fontSize: 12,
    },
  },

  // Tooltip
  tooltip: {
    backgroundColor: colors.vettrCard,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem', // rounded-xl
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Colors
  colors: {
    primary: colors.vettrAccent,
    secondary: colors.vettrCard,
    tertiary: colors.gray600,

    // Component-specific colors
    pedigree: colors.blue400,
    filingVelocity: colors.purple400,
    redFlag: colors.red400,
    growth: colors.vettrAccent,
    governance: colors.yellow400,

    // Chart variations
    barPrimary: colors.vettrAccent,
    barSecondary: '#2A4058',

    // Reference lines
    referenceLine: colors.yellow400,
  },

  // Gradients
  gradients: {
    areaFill: {
      start: 'rgba(0, 230, 118, 0.2)',
      end: 'rgba(0, 230, 118, 0)',
    },
  },

  // Text colors
  text: {
    primary: colors.white,
    secondary: colors.gray400,
    muted: colors.gray500,
  },
};

// Helper function to get score color
export const getScoreColor = (score: number): string => {
  if (score >= 80) return colors.vettrAccent;
  if (score >= 60) return colors.yellow400;
  if (score >= 40) return colors.orange400;
  return colors.red400;
};

// Helper function to get component color
export const getComponentColor = (component: string): string => {
  switch (component.toLowerCase()) {
    case 'pedigree':
      return chartTheme.colors.pedigree;
    case 'filing_velocity':
    case 'filing velocity':
      return chartTheme.colors.filingVelocity;
    case 'red_flag':
    case 'red flag':
      return chartTheme.colors.redFlag;
    case 'growth':
      return chartTheme.colors.growth;
    case 'governance':
      return chartTheme.colors.governance;
    default:
      return chartTheme.colors.primary;
  }
};

// Custom tooltip style factory
export const getTooltipStyle = () => ({
  backgroundColor: chartTheme.tooltip.backgroundColor,
  border: chartTheme.tooltip.border,
  borderRadius: chartTheme.tooltip.borderRadius,
  boxShadow: chartTheme.tooltip.boxShadow,
  padding: '0.75rem',
});
