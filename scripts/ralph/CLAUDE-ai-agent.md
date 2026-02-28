# VETTR Web App AI Agent - Ralph Agent Instructions

You are an autonomous coding agent adding the VETTR AI Agent chat overlay to the existing VETTR web app.

## Your Task

1. Read the PRD at `scripts/ralph/prd-ai-agent.json`
2. Read the progress log at `scripts/ralph/progress-ai-agent.txt` (create if doesn't exist)
3. Check you're on the correct branch from PRD `branchName`. If not, create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks (see Quality Commands below)
7. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
8. Update the PRD to set `passes: true` for the completed story
9. Append your progress to `scripts/ralph/progress-ai-agent.txt`

**IMPORTANT**: You are modifying an EXISTING codebase. Read existing files before changing them.

---

## Quality Commands

Run from project root (`/Users/manav/Space/code/vettr-web`):

```bash
npm run build
npm run lint
```

Both MUST pass before committing.

---

## Context: What You're Building

A conversational chat overlay for stock fundamentals analysis. Users click a floating "VETTR AI" button to open a panel, select pre-defined questions about a stock, and receive formatted responses with opinionated verdicts.

**Key behaviors:**
- Global floating button on all authenticated pages (bottom-right)
- Panel slides in from bottom-right (400px desktop, full-width mobile)
- Auto-detects ticker when on `/stocks/[ticker]` pages
- Shows ticker picker when on other pages
- 6 initial question categories → 2 follow-ups each
- Responses have colored verdict badges + data point grids
- Daily usage tracking with upgrade prompts
- Tier limits: FREE=3/day, PRO=15/day, PREMIUM=unlimited

**New files to create:**
```
src/
├── types/ai-agent.ts
├── hooks/
│   ├── useAiAgent.ts
│   ├── useAiAgentQuestions.ts
│   └── useAiAgentUsage.ts
├── contexts/AiAgentContext.tsx
└── components/ai-agent/
    ├── AiAgentButton.tsx
    ├── AiAgentPanel.tsx
    ├── AiAgentQuestions.tsx
    ├── AiAgentResponse.tsx
    ├── AiAgentUsageBar.tsx
    └── AiAgentTickerPicker.tsx
```

**Existing file to modify:**
- `src/app/(main)/layout.tsx` — add provider + button + panel

---

## Backend API Endpoints

Base URL: `https://vettr-backend.vercel.app/v1`

```
GET  /ai-agent/questions              → { questions: AiAgentQuestion[] }
GET  /ai-agent/questions?parent_id=X  → { questions: AiAgentQuestion[] } (follow-ups)
POST /ai-agent/ask                    → AiAgentResponse (body: { question_id, ticker })
GET  /ai-agent/usage                  → { used, limit, remaining, resets_at }
```

**Response format (POST /ai-agent/ask):**
```json
{
  "success": true,
  "data": {
    "question_id": "financial_health",
    "ticker": "SHOP",
    "response": {
      "summary": "**Shopify** is in **strong financial health**...",
      "details": [
        { "label": "Altman Z-Score", "value": "4.2", "status": "safe" },
        { "label": "Cash Runway", "value": "36+ months", "status": "safe" }
      ],
      "verdict": "Strong",
      "verdict_color": "green"
    },
    "follow_up_questions": [
      { "id": "debt_analysis", "label": "What's SHOP's debt situation?", "category": "financial_health", "parent_id": "financial_health", "icon": "heart" }
    ],
    "usage": { "used": 1, "limit": 3, "remaining": 2, "resets_at": "2026-02-25T00:00:00.000Z" }
  }
}
```

**429 (limit reached):**
```json
{
  "success": false,
  "error": {
    "code": "TIER_LIMIT_EXCEEDED",
    "message": "Daily question limit reached",
    "details": { "used": 3, "limit": 3, "upgrade_prompt": true, "resets_at": "..." }
  }
}
```

---

## Design System (MUST FOLLOW)

### Colors
```
vettr-navy:   #0D1B2A   // Main background
vettr-dark:   #1B2838   // Panel background
vettr-card:   #1E3348   // Card backgrounds
vettr-accent: #00E676   // Primary accent (green)
```

### AI Agent Specific Patterns

**Panel:**
```tsx
<div className="bg-vettr-dark border border-white/10 rounded-2xl shadow-2xl">
```

**Question Card:**
```tsx
<button className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                   hover:border-vettr-accent/30 hover:bg-white/10
                   transition-all text-left flex items-center gap-3">
  <icon className="w-5 h-5 text-vettr-accent" />
  <span className="text-sm text-gray-300">Question text</span>
  <chevron className="w-4 h-4 text-gray-500 ml-auto" />
</button>
```

**Follow-up Chip:**
```tsx
<button className="bg-vettr-accent/10 text-vettr-accent text-xs
                   rounded-full px-3 py-1.5 hover:bg-vettr-accent/20
                   transition-colors">
```

**Verdict Badge:**
```tsx
// Green
<span className="bg-green-500/10 text-green-400 rounded-full px-3 py-1 text-xs font-semibold">
// Yellow
<span className="bg-yellow-500/10 text-yellow-400 rounded-full px-3 py-1 text-xs font-semibold">
// Red
<span className="bg-red-500/10 text-red-400 rounded-full px-3 py-1 text-xs font-semibold">
```

**Status Dots (in details grid):**
```tsx
<div className={`w-2 h-2 rounded-full ${
  status === 'safe' ? 'bg-green-400' :
  status === 'warning' ? 'bg-yellow-400' :
  status === 'danger' ? 'bg-red-400' :
  'bg-gray-400'
}`} />
```

**Ticker Chip:**
```tsx
<span className="bg-vettr-accent/10 text-vettr-accent rounded-lg px-2 py-0.5 text-sm font-mono font-semibold">
  SHOP
</span>
```

**Usage Progress Bar:**
```tsx
<div className="w-full bg-white/5 rounded-full h-1.5">
  <div className="h-1.5 rounded-full transition-all duration-500"
       style={{ width: `${(used/limit)*100}%`, backgroundColor: fillColor }} />
</div>
```

---

## Existing Code to Reuse

### SWR Hook Pattern (from useVetrScore.ts, useFundamentals.ts)
```typescript
'use client';
import useSWR from 'swr';
import { api } from '@/lib/api-client';

async function fetchQuestions(url: string): Promise<AiAgentQuestion[]> {
  const response = await api.get<{ questions: AiAgentQuestion[] }>(url);
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch');
  }
  return response.data.questions;
}

export function useAiAgentQuestions(parentId?: string) {
  const endpoint = parentId ? `/ai-agent/questions?parent_id=${parentId}` : '/ai-agent/questions';
  const { data, error, isLoading } = useSWR(endpoint, fetchQuestions);
  return { questions: data ?? [], isLoading, error };
}
```

### API Client (from lib/api-client.ts)
```typescript
import { api } from '@/lib/api-client';
// GET: const response = await api.get<T>(url);
// POST: const response = await api.post<T>(url, body);
// Response shape: { success: boolean, data?: T, error?: { code, message } }
```

### Context Pattern (from contexts/ToastContext.tsx, QuickSearchContext.tsx)
```typescript
'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const AiAgentContext = createContext<AiAgentContextType | null>(null);

export function AiAgentProvider({ children }: { children: React.ReactNode }) {
  // state + handlers
  return <AiAgentContext.Provider value={value}>{children}</AiAgentContext.Provider>;
}

export function useAiAgentContext() {
  const ctx = useContext(AiAgentContext);
  if (!ctx) throw new Error('useAiAgentContext must be within AiAgentProvider');
  return ctx;
}
```

### Main Layout Pattern (current structure)
```tsx
// src/app/(main)/layout.tsx
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <QuickSearchProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </QuickSearchProvider>
  );
}
// Add AiAgentProvider wrapping inside QuickSearchProvider
```

### Stock Search (useStockSearch hook already exists)
```typescript
import { useStockSearch } from '@/hooks/useStockSearch';
const { results, isLoading } = useStockSearch(query);
// results: Array<{ ticker, company_name, sector, ... }>
```

---

## Common Gotchas

1. **'use client'**: Required for all components with hooks/state/browser APIs
2. **SVG icons only**: Never use emoji. Create inline SVG icons.
3. **Light mode support**: The app has both dark and light modes. Use `dark:` prefix for dark-mode-only styles and provide light equivalents: `bg-white dark:bg-vettr-dark`, `text-gray-900 dark:text-white`
4. **Mobile nav clearance**: Bottom nav is fixed h-16 on mobile. FAB must be above it (bottom-24).
5. **SWR Provider**: Already configured in root layout — don't add another.
6. **Token keys**: `vettr_access_token` and `vettr_refresh_token` in localStorage.
7. **usePathname**: Import from `next/navigation` for route detection.
8. **Framer Motion**: Already installed. Use AnimatePresence for mount/unmount animations.
9. **z-index layers**: z-10 (content) < z-30 (sticky header/tabs) < z-40 (AI panel) < z-50 (modals) < z-[100] (toast)
10. **Existing code**: READ existing files before modifying. Don't remove functionality.

---

## Progress Report Format

APPEND to `scripts/ralph/progress-ai-agent.txt`:

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

After completing a story, check if ALL stories in `scripts/ralph/prd-ai-agent.json` have `passes: true`.
If ALL complete: `<promise>COMPLETE</promise>`
If stories remain: end normally for next iteration.
