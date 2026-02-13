import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // VETTR Design Tokens - Dark Theme (Default)
        'vettr-navy': '#0D1B2A',     // Main background
        'vettr-dark': '#1B2838',     // Sidebar, darker sections
        'vettr-card': '#1E3348',     // Card backgrounds
        'vettr-accent': '#00E676',   // Primary accent (green)
        foreground: '#E8EDF2',       // Primary text

        // Additional semantic colors
        warning: '#FFB300',
        error: '#FF5252',
        success: '#00E676',

        // Light theme colors (for future use with dark: variants)
        lightBg: '#F8FAFC',
        lightSurface: '#FFFFFF',
        lightSurfaceLight: '#F1F5F9',
        lightBorder: '#E2E8F0',
        lightTextPrimary: '#0F172A',
        lightTextSecondary: '#475569',
        lightTextMuted: '#94A3B8',
      },
      borderRadius: {
        'lg': '0.5rem',    // For inputs
        'xl': '0.75rem',   // For buttons
        '2xl': '1rem',     // Default for cards
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
}
export default config
