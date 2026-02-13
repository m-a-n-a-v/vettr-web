# VETTR Web App V2

A premium stock analysis platform for Canadian small-cap stocks, featuring VETTR scores, red flags, executive pedigree tracking, filings, and customizable alerts.

## Features

### Core Functionality
- **Stock Analysis**: Comprehensive stock data with VETTR scoring system
- **Executive Pedigree**: Track executive backgrounds, tenure, and career quality
- **Red Flags**: Automated risk detection and severity scoring
- **Filing Tracking**: Material filing monitoring and analysis
- **Custom Alerts**: Configure alerts for price movements, VETTR score changes, and red flags
- **Watchlist**: Track favorite stocks with personalized dashboard

### V2 Redesign Highlights
- **Premium UI/UX**: Professional dark mode SaaS design inspired by Linear, Vercel, and Raycast
- **Design System**: Consistent design tokens, components, and patterns
- **Performance Monitoring**: Integrated Vercel Analytics and Speed Insights
- **Responsive Design**: Optimized for mobile, tablet, and desktop viewports
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation
- **Authentication**: Secure JWT-based auth with automatic token refresh

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **State Management**: [SWR](https://swr.vercel.app/) for data fetching and caching
- **Charts**: [Recharts](https://recharts.org/) for data visualization
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth transitions
- **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa) for offline support
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) and Speed Insights
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/m-a-n-a-v/vettr-web.git
cd vettr-web
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://vettr-backend.vercel.app/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code quality checks

## Project Structure

```
vettr-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes (login, signup)
│   │   ├── (main)/            # Protected app routes
│   │   ├── globals.css        # Global styles and CSS variables
│   │   └── layout.tsx         # Root layout with providers
│   ├── components/            # React components
│   │   ├── icons/             # SVG icon components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts (Auth, Theme, Toast)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── api-client.ts      # API client with auth handling
│   │   ├── chart-theme.ts     # Recharts theme configuration
│   │   └── swr-config.tsx     # SWR global configuration
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── scripts/                   # Development scripts
└── tailwind.config.ts         # Tailwind CSS configuration
```

## Design System

### Color Palette
- **vettr-navy** (`#0D1B2A`) - Main background
- **vettr-dark** (`#1B2838`) - Sidebar, darker sections
- **vettr-card** (`#1E3348`) - Card backgrounds
- **vettr-accent** (`#00E676`) - Primary accent (green)
- **foreground** (`#E8EDF2`) - Primary text

### Component Patterns
All components follow consistent styling patterns defined in `CLAUDE.md`:
- Cards with subtle transparency and hover effects
- Form inputs with refined focus states
- Buttons with clear visual hierarchy
- Tables with sticky headers and hover highlights

## API Integration

The app connects to the VETTR backend API at `https://vettr-backend.vercel.app/v1`.

### Authentication
- JWT-based authentication with access and refresh tokens
- Automatic token refresh on expiration
- Secure token storage in localStorage

### Key Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /stocks` - List stocks with filtering
- `GET /stocks/:ticker` - Stock details
- `GET /stocks/:ticker/vetr-score` - VETTR score data
- `GET /stocks/:ticker/red-flags` - Red flag analysis
- `GET /filings` - Filing data
- `GET /executives/search` - Executive search
- `GET /alerts/rules` - Alert rule management
- `GET /watchlist` - User watchlist

See `CLAUDE.md` for complete API documentation.

## Development Guidelines

### Code Quality
- TypeScript strict mode enabled
- ESLint for code quality
- No `any` types allowed
- No `console.log` in production code (use `console.error` for errors)

### Design Principles
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA)
- Progressive enhancement
- Performance optimization
- Semantic HTML

### Component Development
- Use 'use client' directive for client components
- Prefer server components by default
- Follow established design patterns
- Use SVG icons (no emoji)
- Implement proper loading and error states

## Deployment

The app is deployed on Vercel at [vettr-web.vercel.app](https://vettr-web.vercel.app).

### Environment Variables (Vercel)
Configure these in your Vercel project settings:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend app URL

### Build Configuration
The project includes:
- `vercel.json` for deployment configuration
- PWA service worker for offline support
- Vercel Analytics for usage tracking
- Speed Insights for performance monitoring

## Contributing

1. Follow the established code style and patterns
2. Run `npm run lint` before committing
3. Ensure `npm run build` passes without warnings
4. Test on multiple viewports (375px, 768px, 1024px, 1440px)
5. Maintain WCAG 2.1 AA accessibility standards

## License

ISC

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/m-a-n-a-v/vettr-web/issues) page.
