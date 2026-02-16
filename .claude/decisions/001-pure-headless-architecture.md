# ADR-001: Pure Headless Architecture Migration

**Date**: 2026-02-15
**Status**: In Progress
**Deciders**: AMK
**Tags**: architecture, frontend, backend, mobile

## Context

Command Center initially had a **Hybrid Architecture**:

- Frontend: SvelteKit with local API routes (`/api/extract-entry`, `/api/transcribe`, etc.)
- Data Storage: **localStorage** (browser-only, single device)
- Backend: Separate Journal API (port 3002) with SQLite, but **not connected** to frontend

**Problem identified**: User needs Command Center working on **phone AND desktop**, which localStorage cannot support (browser-bound, no cross-device sync).

**Validation findings** (from 3 parallel agents):

- **TypeScript**: 110 errors (down to 86, but still failing)
- **UX**: 7.0/10 (Joe Gebbia framework) - good foundation but room for improvement
- **Integration**: Frontend and backend are "two separate systems" with no communication

**M&A Tracker precedent**: Already successfully migrated to Pure Headless (Phase 3), working perfectly with shared SQLite database.

## Decision

**Migrate to Pure Headless Architecture**:

```
┌─────────────────┐
│  SvelteKit      │  Pure client (no /api routes)
│  Frontend       │  Uses SDK for all data operations
└────────┬────────┘
         │ HTTP (SDK)
         │
┌────────▼────────┐
│  Journal API    │  Backend on port 3002
│  (Bun runtime)  │  All business logic + data
└────────┬────────┘
         │ Drizzle ORM
         │
┌────────▼────────┐
│  SQLite DB      │  Single source of truth
│  journal.db     │  Phone ↔ Desktop sync
└─────────────────┘
```

**Migration scope** (11 parallel agents):

### Implementation Agents (7):

1. **Agent 10**: Backend Files→SQLite - Migrate 31 markdown entries to database
2. **Agent 11**: CRM Backend - Add people CRUD endpoints, SDK methods, frontend updates
3. **Agent 12**: Reviews Backend - Daily reviews table, API endpoints, SDK integration
4. **Agent 13**: Habits Backend - Habits/logs tables, streak calculation, API endpoints
5. **Agent 14**: localStorage Elimination - Remove all data writes, keep only UI preferences
6. **Agent 15**: Mobile-Responsive UI - Bottom tab bar, ≥44px touch targets
7. **Agent 16**: PWA Setup - Manifest, service worker, offline support

### Validation Agents (4):

8. **Agent 17**: TypeScript validation (Context7 MCP)
9. **Agent 18**: UX validation (Playwright MCP)
10. **Agent 19**: Integration E2E testing (Serper MCP)
11. **Agent 20**: Strategic review (Context7 + Serper MCP)

## Consequences

### Positive

✅ **Phone + Desktop sync**: Data in SQLite accessible from any device
✅ **Single source of truth**: No localStorage + SQLite conflicts
✅ **Type safety**: SDK provides TypeScript types for all API calls
✅ **Proven pattern**: M&A Tracker already successful with this architecture
✅ **Backend reuse**: Multiple frontends can consume same API (future mobile apps)
✅ **Offline queue**: Service worker can queue requests when offline

### Negative

⚠️ **Migration effort**: ~8-12 hours total (7 implementation agents + validation)
⚠️ **Backend dependency**: Frontend cannot work without backend running
⚠️ **API latency**: Network calls slower than localStorage (mitigated by caching)
⚠️ **Complexity**: More moving parts (frontend + backend + database vs just frontend)

### Neutral

🔄 **SDK maintenance**: Need to keep SDK in sync with backend API changes
🔄 **Backend deployment**: Must deploy backend separately from frontend
🔄 **Auth required**: Backend needs authentication (already implemented)

## Implementation Status

**Completed** (Agents 10-13):

- ✅ Backend database schema updated (entries, people, reviews, habits)
- ✅ Migration files created (31 entries ready to import)
- ✅ Complete implementation plans with code provided
- ✅ SDK structure defined (CRM, Reviews, Habits endpoints)

**In Progress** (Agents 14-20):

- 🔄 localStorage cleanup
- 🔄 Mobile-responsive UI
- 🔄 PWA setup
- 🔄 Final validation (TypeScript, UX, Integration, Strategic)

**Blocked**:

- ⏸️ M&A Tracker frontend issues (deferred until Command Center 100% working per user request)

## Alternatives Considered

### Option A: Keep Hybrid (Current State)

- **Pros**: No migration work, both architectures available
- **Cons**: Data sync issues, localStorage won't work on phone, code duplication
- **Rejected**: Doesn't solve user's phone + desktop requirement

### Option B: Pure Local (All localStorage)

- **Pros**: Simplest, no backend needed
- **Cons**: No multi-device sync, localStorage size limits (5-10MB), no offline queue
- **Rejected**: Phone + desktop sync impossible

### Option C: Pure Headless (Chosen)

- **Pros**: Phone + desktop sync, single source of truth, proven pattern
- **Cons**: Backend dependency, more complexity
- **Selected**: Only option that meets phone + desktop requirement

## References

- **Previous Migrations**: M&A Tracker Pure Headless migration (Phase 3, successful)
- **Validation Reports**:
  - `COMMAND-CENTER-VALIDATION-SUMMARY.md` (3 parallel agents)
  - `INTEGRATION-VALIDATION-REPORT.md` (400+ lines)
  - `TYPESCRIPT-VALIDATION-REPORT.md` (110 errors → 86 errors)
- **Implementation Plans**: Agent outputs for CRM, Reviews, Habits migrations

## Notes

- User explicitly confirmed: "I need it on the phone though" + "and on desktop"
- User prioritized Command Center over M&A Tracker: "No first continue with validation agent. Keep this on the debt md and then only do this once the command center works 100%"
- Architecture matches Journal API backend pattern (already built, just needs frontend integration)

---

_Last updated: 2026-02-15_
