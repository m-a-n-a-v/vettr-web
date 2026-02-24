# VETTR Web App - Fundamentals Features - Ralph Agent Instructions

You are an autonomous coding agent adding **fundamentals data features** to the VETTR web app. The app already exists with a working stock detail page (Overview, Pedigree, Red-Flags tabs). Your job is to add a new Fundamentals tab and enhance existing sections with financial health indicators, earnings quality scores, analyst consensus, and peer comparison.

**CRITICAL**: You are modifying EXISTING code, not building from scratch. Read the existing files before changing them. Preserve all existing functionality while adding new features.

**CRITICAL**: All data uses DUMMY/MOCK values. Do NOT make any backend API calls for fundamentals data. Create a dummy data generator that returns realistic mock data.

## Your Task

1. Read the PRD at `scripts/ralph/fund-prd.json`
2. Read the progress log at `scripts/ralph/fund-progress.txt`
3. Ensure you're on the correct branch from PRD `branchName` field. If not, create and switch to it.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that **single** user story
6. Run quality checks (see Quality Commands below)
7. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
8. Update the PRD (`scripts/ralph/fund-prd.json`): set `passes: true` for the completed story
9. Append your progress to `scripts/ralph/fund-progress.txt`

**IMPORTANT**: Work on exactly ONE story per iteration. Do NOT batch multiple stories.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router) — ALREADY SET UP
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (with VETTR custom theme)
- **State/Data**: SWR (already configured), but fundamentals use dummy data hook
- **Charts**: Recharts (already installed)
- **Animations**: Framer Motion (already installed)

## Key Existing Files You MUST Read Before Modifying

- `src/app/(main)/stocks/[ticker]/page.tsx` — Stock detail page (3 tabs currently). This is the main file you'll modify to add the Fundamentals tab.
- `src/types/api.ts` — Existing TypeScript types for API data. Create NEW file for fundamentals types.
- `src/components/ui/VetrScoreBadge.tsx` — Circular score badge pattern to reuse.
- `src/components/VetrScoreComparison.tsx` — Recharts usage patterns.
- `src/lib/chart-theme.ts` — Chart colors and theme (has getScoreColor function).
- `src/hooks/useVetrScore.ts` — Hook pattern to follow for useFundamentals.
- `src/components/ui/SkeletonLoader.tsx` — Skeleton loading pattern.

## Quality Commands

Run these before committing. ALL must pass:

```bash
npm run build
npm run lint
```

If either fails, fix the issues before committing. Do NOT skip quality checks.

---

## Design System — MUST FOLLOW

This is the premium design language. Every component you create MUST follow these patterns.

### Color Palette (Tailwind theme names)
```
vettr-navy:    #0D1B2A    // Main background
vettr-dark:    #1B2838    // Sidebar, darker sections
vettr-card:    #1E3348    // Card backgrounds
vettr-accent:  #00E676    // Primary accent (green)
foreground:    #E8EDF2    // Primary text
```

### 5-Tier Score Color Scale (use everywhere for metrics)
```
90-100: #166534 (dark green) — Excellent
75-89:  #00E676 (green)      — Good
50-74:  #FBBF24 (yellow)     — Moderate
30-49:  #FB923C (orange)     — Concerning
0-29:   #F87171 (red)        — Critical
```

### Card Pattern (use for ALL cards)
```tsx
<div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5
                hover:border-vettr-accent/20 hover:bg-vettr-card/80
                transition-all duration-300">
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

### Metric Card Pattern (for Financial Health dashboard)
```tsx
<div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5">
  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Metric Name</div>
  <div className="text-2xl font-bold text-white">Value</div>
  <div className="text-xs text-gray-400 mt-1">Subtitle or context</div>
</div>
```

### Status Indicator Colors (for health metrics)
```tsx
// Good/Healthy
<span className="text-emerald-400"> or <div className="bg-emerald-400/10 text-emerald-400">

// Warning/Watch
<span className="text-yellow-400"> or <div className="bg-yellow-400/10 text-yellow-400">

// Danger/Critical
<span className="text-red-400"> or <div className="bg-red-400/10 text-red-400">
```

### Typography Hierarchy
- Page title: `text-2xl font-bold text-white`
- Section title: `text-lg font-semibold text-white`
- Card title: `text-sm font-semibold text-white`
- Body: `text-sm text-gray-300`
- Caption: `text-xs text-gray-500`
- Label: `text-xs text-gray-500 uppercase tracking-wider`
- Big metric value: `text-2xl font-bold text-white` or `text-3xl font-bold text-white`

### Icons — SVG ONLY (no emoji)
All icons must be inline SVG with:
```tsx
<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
```
NEVER use emoji characters as icons. Create proper SVG icons.

### Spacing System
- Section padding: `p-6` (desktop), `p-4` (mobile)
- Card padding: `p-5`
- Gap between cards: `gap-4` or `gap-6`
- Between sections: `mb-8`

---

## Dummy Data Guidelines

When creating the dummy data generator (`src/lib/dummy-fundamentals.ts`):

1. **Deterministic**: Same ticker should always return same values. Use a simple hash of ticker string as seed.
2. **Realistic ranges**:
   - Cash Runway: 3-36 months
   - Altman Z-Score: 0.5-5.0
   - P/E Ratio: 5-80
   - Gross Margin: 15-65%
   - Operating Margin: -10% to 40%
   - EPS: -$0.50 to $5.00
   - Revenue: $50M - $2B
   - Analyst count: 3-15
   - Short Interest: 0.5-15%
3. **Mining sector bias**: Since VETTR focuses on Canadian small-caps (often mining), default to mining-like values.
4. **4 years of financials**: Generate 2021-2024 annual periods with realistic year-over-year growth/decline patterns.
5. **Earnings surprise**: Mix of beats and misses, with recent quarters more likely to beat.

---

## Recharts Usage Patterns

Follow these patterns for consistency with existing charts:

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

// Always wrap in ResponsiveContainer
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={data}>
    <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
    <Tooltip
      contentStyle={{
        backgroundColor: '#1E3348',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: '#fff',
      }}
    />
    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

Use `getScoreColor` from `src/lib/chart-theme.ts` for score-based coloring.

---

## Component File Structure

Create new components in a `fundamentals` subdirectory:
```
src/components/fundamentals/
  FinancialHealthDashboard.tsx
  EarningsQualityCard.tsx
  AnalystConsensusCard.tsx
  PeerComparisonFinancials.tsx
  ScoreDrivers.tsx
  FinancialStatements.tsx
  ShortInterestBadge.tsx
  InsiderActivity.tsx
```

Each component should:
- Be a `'use client'` component
- Export a named component (not default)
- Accept typed props
- Handle loading/empty states gracefully
- Follow design system patterns exactly

---

## Common Gotchas

1. **'use client'**: Required for components with hooks, state, browser APIs.
2. **Dynamic Routes**: `[ticker]/page.tsx` receives `{ params: { ticker: string } }` — in Next.js 15+, params is a Promise, so use `await params` or `use(params)`.
3. **Recharts SSR**: Recharts components must be in `'use client'` files. Wrap in `ResponsiveContainer`.
4. **Tailwind content**: All component paths should already be covered by the glob in tailwind config.
5. **Existing code**: READ existing files before modifying. Don't accidentally remove functionality.
6. **Stock detail page is large**: The file `stocks/[ticker]/page.tsx` is ~1400 lines. Be careful when adding to it — read the relevant sections, make surgical edits.
7. **Tab type**: Currently `type Tab = 'overview' | 'pedigree' | 'red-flags'`. You need to add `'fundamentals'` to this union.
8. **Framer Motion**: Use `motion.div` with `initial={{ opacity: 0 }}` `animate={{ opacity: 1 }}` for tab content entrance.
9. **The params pattern**: In the stock detail page, params are handled at the top. Look for the existing pattern and follow it.

---

## Progress Report Format

APPEND (never replace) to `scripts/ralph/fund-progress.txt`:

```markdown
## [Story ID]: [Story Title]
Status: COMPLETE
Date: [date]
Working Directory: /Users/manav/Space/code/vettr-web
Details:
- What was changed
- Files created/modified
- **Learnings for future iterations:**
  - Patterns applied
  - Gotchas encountered
---
```

---

## Stop Condition

After completing a story, check if ALL stories in `scripts/ralph/fund-prd.json` have `passes: true`.

If ALL stories are complete, output the following tag on its own line (NOT in a code block, NOT as an example — output it literally):

ALL_STORIES_DONE

If there are still stories with `passes: false`, just end your response normally. Do NOT mention or reference the stop tag in your response if you are not done.
