# VETTR Web App - Ralph Agent Instructions

You are an autonomous coding agent building a responsive web application for VETTR — a stock analysis platform focused on Canadian small-cap stocks.

## Your Task

1. Read the PRD at `scripts/ralph/prd.json`
2. Read the progress log at `scripts/ralph/progress.txt` (check **Codebase Patterns** section first for learnings from prior iterations)
3. Ensure you're on the correct branch from PRD `branchName` field. If not, create and switch to it.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that **single** user story
6. Run quality checks (see Quality Commands below)
7. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
8. Update the PRD: set `passes: true` for the completed story
9. Append your progress to `scripts/ralph/progress.txt`

**IMPORTANT**: Work on exactly ONE story per iteration. Do NOT batch multiple stories.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3
- **State/Data**: SWR or React Query for server state
- **Charts**: Recharts (lightweight, React-native charting)
- **Animations**: Framer Motion
- **PWA**: next-pwa (for WEB-054)
- **Deployment**: Vercel

## Backend API

- **Base URL**: `https://vettr-backend.vercel.app/v1`
- **Auth**: JWT Bearer tokens (access + refresh)
  - `POST /auth/signup` — Register
  - `POST /auth/login` — Login
  - `POST /auth/refresh` — Refresh token
  - `POST /auth/logout` — Logout
- **Stocks**: `GET /stocks`, `GET /stocks/:ticker`, `GET /stocks/search?q=`
- **Filings**: `GET /filings`, `GET /filings/:id`, `POST /filings/:id/read`
- **Executives**: `GET /executives/search`, `GET /executives/:id`
- **VETR Score**: `GET /stocks/:ticker/vetr-score`, `/history`, `/trend`, `/compare`
- **Red Flags**: `GET /stocks/:ticker/red-flags`, `/history`, `POST .../acknowledge-all`, `POST /red-flags/:id/acknowledge`
- **Red Flag Global**: `GET /red-flags/trend`, `GET /red-flags/history`
- **Watchlist**: `GET /watchlist`, `POST /watchlist/:ticker`, `DELETE /watchlist/:ticker`
- **Alerts**: `GET /alerts/rules`, `POST /alerts/rules`, `PUT /alerts/rules/:id`, `DELETE /alerts/rules/:id`, `POST .../enable`, `POST .../disable`
- **Users**: `GET /users/me`, `PUT /users/me`, `GET /users/me/settings`, `PUT /users/me/settings`
- **Subscription**: `GET /subscription`
- **Sync**: `POST /sync/pull`, `POST /sync/push`, `POST /sync/resolve`

### API Response Format

All endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "...", "request_id": "..." }
}
```

Paginated:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": { "total": 25, "limit": 25, "offset": 0, "has_more": false }
  }
}
```

Error:
```json
{
  "success": false,
  "error": { "code": "AUTH_REQUIRED", "message": "..." }
}
```

### Authentication Flow

1. User logs in via `POST /auth/login` → receives `{ accessToken, refreshToken, user }`
2. Store `accessToken` in memory/localStorage, `refreshToken` in localStorage
3. Send `Authorization: Bearer <accessToken>` on all authenticated requests
4. On 401, call `POST /auth/refresh` with `{ refreshToken }` → new tokens
5. If refresh fails, redirect to /login

---

## Quality Commands

Run these before committing. ALL must pass:

```bash
npm run build
npm run lint
```

If either fails, fix the issues before committing.

---

## Project Structure

```
vettr-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (AuthProvider, ThemeProvider, Toasts)
│   │   ├── page.tsx                # Root redirect to /pulse
│   │   ├── not-found.tsx           # 404 page
│   │   ├── error.tsx               # Error boundary
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   └── (main)/
│   │       ├── layout.tsx          # Nav shell (sidebar + bottom tabs)
│   │       ├── pulse/page.tsx
│   │       ├── discovery/page.tsx
│   │       ├── stocks/
│   │       │   ├── page.tsx        # Stock list
│   │       │   └── [ticker]/
│   │       │       └── page.tsx    # Stock detail (3 tabs)
│   │       ├── filings/
│   │       │   └── [id]/page.tsx
│   │       ├── alerts/page.tsx
│   │       └── profile/
│   │           ├── page.tsx
│   │           ├── settings/page.tsx
│   │           ├── glossary/page.tsx
│   │           └── faq/page.tsx
│   ├── components/
│   │   ├── ui/                     # Reusable primitives
│   │   │   ├── StockCard.tsx
│   │   │   ├── VetrScoreBadge.tsx
│   │   │   ├── SectorChip.tsx
│   │   │   ├── FilingTypeIcon.tsx
│   │   │   ├── PriceChangeIndicator.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── SelectDropdown.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── ExecutiveDetail.tsx
│   │   ├── VetrScoreDetail.tsx
│   │   ├── AlertRuleCreator.tsx
│   │   ├── FeedbackForm.tsx
│   │   ├── Onboarding.tsx
│   │   └── QuickSearch.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/
│   │   ├── useStocks.ts
│   │   ├── useStock.ts
│   │   ├── useStockSearch.ts
│   │   ├── useFilings.ts
│   │   ├── useFiling.ts
│   │   ├── useExecutives.ts
│   │   ├── useExecutive.ts
│   │   ├── useWatchlist.ts
│   │   ├── useVetrScore.ts
│   │   ├── useVetrScoreHistory.ts
│   │   ├── useRedFlags.ts
│   │   ├── useRedFlagHistory.ts
│   │   ├── useAlertRules.ts
│   │   ├── useSubscription.ts
│   │   └── useMarkFilingRead.ts
│   ├── lib/
│   │   ├── api-client.ts           # Typed fetch wrapper with JWT
│   │   ├── utils.ts                # Formatting helpers
│   │   └── constants.ts            # App constants
│   └── types/
│       └── api.ts                  # All TypeScript types
├── public/
│   ├── favicon.ico
│   └── manifest.json              # PWA manifest
├── scripts/ralph/                  # Ralph loop files
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Design System

### Colors (Tailwind config)
```
primary: '#0D1B2A'       // Dark navy (main background)
primaryLight: '#1B2838'  // Slightly lighter navy (cards)
primaryDark: '#060F1A'   // Darker navy (sidebar)
accent: '#00E676'        // Green (active states, positive)
accentDim: '#00C853'     // Dimmer green
warning: '#FFB300'       // Amber (warnings, material filings)
error: '#FF5252'         // Red (errors, negative changes, critical flags)
surface: '#1E3348'       // Card surface color
surfaceLight: '#2A4058'  // Hover state for cards
textPrimary: '#FFFFFF'   // Primary text
textSecondary: '#94A3B8' // Secondary/muted text
textMuted: '#64748B'     // Very muted text
border: '#334155'        // Border color
```

### Typography
- Font: System font stack (Inter if available)
- Headings: bold, white
- Body: regular, white or textSecondary
- Captions: small, textMuted

### Responsive Breakpoints
- Mobile: < 768px (bottom tab bar, single column)
- Tablet: 768px-1023px (sidebar, 2 columns)
- Desktop: >= 1024px (sidebar, 3-4 columns, table views)

---

## Common Gotchas

1. **Next.js App Router**: Use `'use client'` directive for components with hooks, state, or browser APIs. Server components by default.
2. **Dynamic Routes**: Files at `[ticker]/page.tsx` receive params as `{ params: { ticker: string } }`.
3. **Environment Variables**: Only `NEXT_PUBLIC_*` vars are available client-side. Backend URL must be `NEXT_PUBLIC_API_URL`.
4. **Tailwind Purging**: All component files must be in the `content` array in `tailwind.config.ts`.
5. **SWR/React Query**: Must wrap app in provider (SWRConfig or QueryClientProvider) in root layout.
6. **Image Component**: Use `next/image` with proper width/height or fill props. External images need `remotePatterns` in next.config.js.
7. **Metadata**: Use `export const metadata` in server components, or `generateMetadata()` for dynamic pages.
8. **Route Groups**: `(auth)` and `(main)` are route groups — they organize routes without affecting URL paths.
9. **Protected Routes**: The `(main)/layout.tsx` should check auth status and redirect to `/login` if not authenticated.
10. **API Client**: Always check `response.success` before accessing `response.data`. Handle pagination via `response.data.items` and `response.data.pagination`.
11. **Token Storage**: Access token in `localStorage` as `vettr_access_token`, refresh token as `vettr_refresh_token`.
12. **CORS**: Backend has CORS enabled for all origins (`*`), so no CORS issues expected.

---

## Progress Report Format

APPEND (never replace) to `scripts/ralph/progress.txt`:

```markdown
## [Story ID]: [Story Title]
Status: ✅ COMPLETE
Date: [date]
Working Directory: /Users/manav/Space/code/vettr-web
Details:
- What was implemented
- Files created/changed
- **Learnings for future iterations:**
  - Codebase patterns discovered
  - Gotchas encountered
---
```

---

## Stop Condition

After completing a story, check if ALL stories in prd.json have `passes: true`.

If ALL stories are complete, reply with:
```
<promise>COMPLETE</promise>
```

If there are still stories with `passes: false`, end your response normally (next iteration will continue).
