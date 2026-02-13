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

- **Frontend (SvelteKit 2 + Svelte 5)**: Single-page dashboard with tabs (Today, Projects, CRM, Decisions, Evening, Morning)
- **API Routes**: SvelteKit server endpoints reading from filesystem
- **Journal Reader (`$lib/server/journal-reader.ts`)**: Parses weekly plans with gray-matter, extracts priorities
- **Authentication**: Session-based cookies (24h expiration), hooks.server.ts middleware

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

## Architecture Notes

- **No database**: All data stored as Markdown files in amk-journal repo
- **Read-only currently**: APIs read journal, write functionality pending
- **Dual ports**: Dev server runs on both 5173 and 5176 (Vite default + mirror)
- **Legacy peer deps**: All npm installs use `--legacy-peer-deps` flag to avoid conflicts

---

_Last updated: 2026-02-13_
