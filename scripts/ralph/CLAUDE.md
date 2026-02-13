# VETTR Web App V2 - Ralph Agent Instructions

You are an autonomous coding agent doing a **professional redesign** of the VETTR web app. The app already exists and has working functionality, but the UI is not production-quality. Your job is to make it look like a premium SaaS dashboard (think Linear, Vercel Dashboard, Raycast) while also fixing critical auth bugs.

**CRITICAL**: You are modifying EXISTING code, not building from scratch. Read the existing files before changing them. Preserve all existing functionality while upgrading the visual design and fixing bugs.

## Your Task

1. Read the PRD at `scripts/ralph/prd-v2.json`
2. Read the progress log at `scripts/ralph/progress-v2.txt` (check **Codebase Patterns** section first)
3. Ensure you're on the correct branch from PRD `branchName` field. If not, create and switch to it.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that **single** user story
6. Run quality checks (see Quality Commands below)
7. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
8. Update the PRD (`scripts/ralph/prd-v2.json`): set `passes: true` for the completed story
9. Append your progress to `scripts/ralph/progress-v2.txt`

**IMPORTANT**: Work on exactly ONE story per iteration. Do NOT batch multiple stories.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router) — ALREADY SET UP
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3
- **State/Data**: SWR (already configured)
- **Charts**: Recharts (already installed)
- **Animations**: Framer Motion (already installed)
- **Deployment**: Vercel (already deployed at vettr-web.vercel.app)

## Backend API

- **Base URL**: `https://vettr-backend.vercel.app/v1`
- **Auth**: JWT Bearer tokens (access + refresh)
  - `POST /auth/signup` — Register (body: `{ email, password, displayName }`)
  - `POST /auth/login` — Login (body: `{ email, password }`)
  - `POST /auth/refresh` — Refresh token (body: `{ refreshToken }`)
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

### API Response Format

All endpoints return:
```json
{ "success": true, "data": { ... }, "meta": { "timestamp": "...", "request_id": "..." } }
```
Paginated: `{ "success": true, "data": { "items": [...], "pagination": { "total", "limit", "offset", "has_more" } } }`
Error: `{ "success": false, "error": { "code": "AUTH_REQUIRED", "message": "..." } }`

### Authentication Flow

1. `POST /auth/login` with `{ email, password }` → `{ accessToken, refreshToken, user }`
2. Store `accessToken` in localStorage as `vettr_access_token`, `refreshToken` as `vettr_refresh_token`
3. Send `Authorization: Bearer <accessToken>` on all authenticated requests
4. On 401, call `POST /auth/refresh` with `{ refreshToken }` → new tokens
5. If refresh fails, clear tokens, redirect to /login

---

## Quality Commands

Run these before committing. ALL must pass:

```bash
npm run build
npm run lint
```

If either fails, fix the issues before committing. Do NOT skip quality checks.

---

## Design System — MUST FOLLOW

This is the premium design language. Every component you touch MUST follow these patterns.

### Color Palette (Tailwind theme names)
```
vettr-navy:    #0D1B2A    // Main background
vettr-dark:    #1B2838    // Sidebar, darker sections
vettr-card:    #1E3348    // Card backgrounds
vettr-accent:  #00E676    // Primary accent (green)
foreground:    #E8EDF2    // Primary text
```

### Card Pattern (use for ALL cards)
```tsx
<div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5
                hover:border-vettr-accent/20 hover:bg-vettr-card/80
                transition-all duration-300">
```

### Input Pattern (use for ALL inputs)
```tsx
<input className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5
                  text-white text-sm placeholder-gray-500
                  focus:border-vettr-accent/40 focus:ring-1 focus:ring-vettr-accent/20
                  transition-all" />
```

### Button Patterns
```tsx
// Primary (accent green)
<button className="bg-vettr-accent text-vettr-navy font-semibold rounded-xl px-4 py-2.5
                   hover:bg-vettr-accent/90 transition-colors">

// Secondary (subtle)
<button className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5
                   hover:bg-white/10 transition-colors">

// Ghost (icon buttons)
<button className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg p-2
                   transition-colors">
```

### Navigation Item Pattern
```tsx
// Active
<a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-vettr-accent bg-vettr-accent/10">

// Inactive
<a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-gray-400 hover:text-white hover:bg-white/5 transition-all">
```

### Table Pattern
```tsx
// Header
<th className="text-xs text-gray-500 uppercase tracking-wider font-medium
               px-4 py-3 text-left sticky top-0 bg-vettr-dark/80 backdrop-blur-sm">

// Row
<tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer">

// Cell
<td className="px-4 py-3 text-sm text-white">
```

### Section Header Pattern
```tsx
<h2 className="text-lg font-semibold text-white mb-4">Section Title</h2>
```

### Badge/Chip Pattern
```tsx
<span className="bg-white/5 text-gray-400 rounded-full px-2.5 py-0.5 text-xs font-medium">
<span className="bg-vettr-accent/10 text-vettr-accent rounded-full px-2.5 py-0.5 text-xs font-medium">
```

### Hover Effects (consistent everywhere)
- Cards: `hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all duration-300`
- Links: `hover:text-vettr-accent transition-colors`
- Icon buttons: `hover:bg-white/5 hover:text-white transition-colors`
- Table rows: `hover:bg-white/[0.03] transition-colors`

### Background Gradients (for visual depth)
```tsx
// Subtle accent glow (behind page content)
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.04)_0%,_transparent_50%)]" />
```

### Typography Hierarchy
- Page title: `text-2xl font-bold text-white`
- Section title: `text-lg font-semibold text-white`
- Card title: `text-sm font-semibold text-white`
- Body: `text-sm text-gray-300`
- Caption: `text-xs text-gray-500`
- Label: `text-xs text-gray-500 uppercase tracking-wider`

### Icons — SVG ONLY (no emoji)
All icons must be inline SVG with:
```tsx
<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
```
NEVER use emoji characters (★, ☆, →, ←, 🚩, etc.) as icons. Create proper SVG icons.

### Spacing System
- Section padding: `p-6` (desktop), `p-4` (mobile)
- Card padding: `p-5`
- Gap between cards: `gap-4` or `gap-6`
- Between sections: `mb-8`

---

## Critical Auth Fix Notes

The authentication is currently **DISABLED** in the codebase:

1. `src/components/ProtectedRoute.tsx` — renders children directly without checking auth (line ~18-21)
2. `src/lib/api-client.ts` — auth redirect on 401 is commented out (line ~228-232)
3. `src/contexts/ThemeContext.tsx` — forces dark mode regardless of preference (line ~20-24)

These MUST be fixed in V2-002. The auth flow architecture (AuthContext, api-client) is solid — it just needs to be re-enabled and tested.

---

## Common Gotchas

1. **'use client'**: Required for components with hooks, state, browser APIs. Server components by default.
2. **Dynamic Routes**: `[ticker]/page.tsx` receives `{ params: { ticker: string } }`.
3. **NEXT_PUBLIC_**: Only these env vars are client-side accessible.
4. **Tailwind content**: Ensure all component paths are in `content` array in tailwind.config.ts.
5. **SWR Provider**: Already configured in root layout — don't add another.
6. **Route Groups**: `(auth)` and `(main)` — organize routes without affecting URLs.
7. **API pagination**: `response.data.items` for arrays, `response.data.pagination` for page info.
8. **Token keys**: `vettr_access_token` and `vettr_refresh_token` in localStorage.
9. **CORS**: Backend allows `*`, no CORS issues.
10. **Existing code**: READ existing files before modifying. Don't accidentally remove functionality.
11. **Recharts colors**: Use CSS variables or constants, NOT hardcoded hex in JSX.
12. **Sticky headers**: Account for h-16 header when using sticky positioning (top-16).

---

## Progress Report Format

APPEND (never replace) to `scripts/ralph/progress-v2.txt`:

```markdown
## [Story ID]: [Story Title]
Status: ✅ COMPLETE
Date: [date]
Working Directory: /Users/manav/Space/code/vettr-web
Details:
- What was changed
- Files modified
- **Learnings for future iterations:**
  - Design patterns applied
  - Gotchas encountered
---
```

---

## Stop Condition

After completing a story, check if ALL stories in `scripts/ralph/prd-v2.json` have `passes: true`.

If ALL stories are complete, reply with:
```
<promise>COMPLETE</promise>
```

If there are still stories with `passes: false`, end your response normally.
