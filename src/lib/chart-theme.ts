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

// Helper function to get score color (5-tier scale)
export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#166534'; // dark green
  if (score >= 75) return colors.vettrAccent; // green (#00E676)
  if (score >= 50) return colors.yellow400; // yellow (#FBBF24)
  if (score >= 30) return colors.orange400; // orange (#FB923C)
  return colors.red400; // red (#F87171)
};

// Custom tooltip style factory
export const getTooltipStyle = () => ({
  backgroundColor: chartTheme.tooltip.backgroundColor,
  border: chartTheme.tooltip.border,
  borderRadius: chartTheme.tooltip.borderRadius,
  boxShadow: chartTheme.tooltip.boxShadow,
  padding: '0.75rem',
});
