# Command Center Architecture

## The Graph

```
[User Browser] → [SvelteKit Frontend (5173/5176)] → [API Routes] → [Journal Files]
                                                    ↓
                                            [gray-matter + js-yaml]
                                                    ↓
                                        [amk-journal repository]
```

## Key Services

### Frontend (SvelteKit 2 + Svelte 5)

- **UI Components**: Single-page dashboard with tabs (Today, Projects, CRM, Decisions, Evening, Morning)
- **SDK Client** (`@amk/command-center-sdk`): Type-safe wrapper for backend API
- **State Management**: Svelte 5 runes ($state, $derived, $props)
- **Authentication**: Session-based cookies (24h expiration)

### Backend (Journal API - Port 3002)

- **Runtime**: Bun (faster than Node.js)
- **Framework**: Hono (lightweight HTTP router)
- **ORM**: Drizzle ORM with SQLite adapter
- **Routes**:
  - `/api/v1/entries` - Daily journal entries (CRUD)
  - `/api/v1/people` - CRM contacts (CRUD) 🆕
  - `/api/v1/daily-reviews` - Morning/evening reviews (CRUD) 🆕
  - `/api/v1/habits` - Habit tracking + streak calculation 🆕
  - `/api/v1/buyers` - M&A buyer tracking
  - `/api/v1/weekly` - Weekly priorities
  - `/api/v1/urgent` - GTD next actions
- **Authentication**: Bearer token (API key)

### Database (SQLite)

- **Location**: `.claude/api/.claude/data/journal.db`
- **Schema**:
  - `workspaces` - Multi-tenant support
  - `users` - User profiles
  - `entries` - Daily journal entries
  - `people` - CRM contacts 🆕
  - `daily_reviews` - Morning/evening reviews 🆕
  - `habits` + `habit_logs` - Habit tracking 🆕
  - `buyers` + `interactions` - M&A tracking
  - `tasks` - GTD tasks
  - `gratitude` + `food` - Daily logging

### SDK Package (`@amk/command-center-sdk`)

- **Location**: `/Users/amk/Projects/amk-journal/packages/command-center-sdk`
- **Endpoints**:
  - `client.entries.*` - Entry operations
  - `client.people.*` - CRM operations 🆕
  - `client.dailyReviews.*` - Review operations 🆕
  - `client.habits.*` - Habit operations 🆕
  - `client.buyers.*` - M&A operations
- **Features**: TypeScript types, error handling, workspace isolation

## External Integrations

- **amk-journal Repository**: File-based journal at `/Users/amk/Projects/amk-journal`
  - `users/amk/next.md` → Urgent items (GTD next actions)
  - `users/amk/weekly-plans/*.md` → Weekly priorities (Warren Buffett 25/5)
  - `users/amk/entries/*.md` → Daily journal entries

## Data Flow

1. **Urgent Items**:

   ```
   NEXT.md → /api/urgent → Parse "- [ ]" checkboxes → Extract context (#tags) → Frontend display
   ```

2. **Weekly Priorities**:

   ```
   weekly-plans/2026-WXX.md → /api/weekly/current → gray-matter parse → Extract "## 🎯 Top 5" → Progress tracking
   ```

3. **Entry Saving** (TODO):
   ```
   Frontend form → /api/entries/[date] → js-yaml.dump → Write to entries/YYYY-MM-DD.md
   ```

## Tech Stack

- **Framework**: SvelteKit 2.x + Svelte 5 (runes: $state, $derived)
- **Styling**: Tailwind CSS v4 + DaisyUI themes
- **Parsing**: gray-matter (frontmatter), js-yaml (YAML serialization)
- **Server**: Vite 6.x dev server
- **Auth**: Session cookies (HttpOnly, SameSite=Lax)
- **AI Integration**: Claude Sonnet 4.5 API for entry extraction
- **Learning System**: 5 courses (Sales, Brand Building, Storytelling, Fundraising, Vibe Coding) with 30-day curricula

## Architecture Notes

- **No database**: All data stored as Markdown files in amk-journal repo
- **Read-only currently**: APIs read journal, write functionality pending
- **Dual ports**: Dev server runs on both 5173 and 5176 (Vite default + mirror)
- **Legacy peer deps**: All npm installs use `--legacy-peer-deps` flag to avoid conflicts
- **Multi-agent reviews**: Use 4+ parallel expert agents (Joe Gebbia, Nir Eyal, GTD, Voice-First) before major releases

---

_Last updated: 2026-02-13_
