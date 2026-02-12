# VETTR Web App

## Project
Responsive web application for VETTR stock analysis platform. Built with Next.js 14+ (App Router), TypeScript, Tailwind CSS.

## Backend API
- **Base URL**: `https://vettr-backend.vercel.app/v1`
- **Auth**: JWT Bearer tokens (POST /auth/login, /auth/signup, /auth/refresh)
- **CORS**: Enabled for all origins

## Quick Commands
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Lint check
npm run start      # Start production server
```

## Key Patterns
- Next.js App Router with route groups: `(auth)` and `(main)`
- `'use client'` for components with hooks/state/browser APIs
- `NEXT_PUBLIC_*` env vars for client-side access
- API response format: `{ success, data, meta }` with pagination via `data.items`
- Token storage: `vettr_access_token` and `vettr_refresh_token` in localStorage

## Ralph Loop
Automated development via `scripts/ralph/ralph.sh`. PRD at `scripts/ralph/prd.json`.
