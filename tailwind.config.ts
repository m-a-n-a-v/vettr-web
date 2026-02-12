import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D1B2A',
        primaryLight: '#1B2838',
        primaryDark: '#060F1A',
        accent: '#00E676',
        accentDim: '#00C853',
        warning: '#FFB300',
        error: '#FF5252',
        surface: '#1E3348',
        surfaceLight: '#2A4058',
        textPrimary: '#FFFFFF',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
        border: '#334155',
      },
    },
  },
  plugins: [],
}
export default config
