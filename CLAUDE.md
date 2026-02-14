# AMK Command Center

Personal productivity dashboard with CRM, habit tracking, and metrics visualization.

---

## Quick Reference

- **Stack**: SvelteKit 2.x + Svelte 5 (runes), TypeScript, Tailwind CSS
- **State Management**: Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **Persistence**: localStorage via PersistenceManager component
- **Dev Server**: `npm run dev`

---

## Architecture

```
[User] → [TodayTab: Chat/Forms] → [Extract Entry API] → [Entry Persistence API] → [amk-journal repo]
              ↓                           ↓
       [QuickEntrySection]         [Coach System]
              ↓                           ↓
    [ExtractionPreview]          [Coach Challenges]

[ZenQuotes API] → [QuoteHeader]
[Weekly Plans] → [WeeklyPrioritiesSidebar]

[Strategic Intelligence] → [User Text/Decisions] → [4 Analysis Tools]
                                                          ↓
                                    [Bias Detector | Contrarian Agent | First Principles | ROI Estimator]
```

### Key Services

- **Entry Persistence API** (`/api/entries/[date]`): POST/GET for saving/loading journal entries with YAML frontmatter
- **Extract Entry API** (`/api/extract-entry`): Claude-powered extraction from voice/text to structured data
- **Weekly API** (`/api/weekly/current`): Warren Buffett 25/5 priority tracking
- **Coaches API** (`/api/coaches/config`): AI mentor system configuration
- **Strategic Intelligence** (`/intelligence`): 4-tool "truth-teller" system - bias detection, contrarian analysis, first principles, ROI estimation (all <10ms, zero dependencies)
- **Brand System** (`/src/lib/brand/index.ts`): Centralized "Nexus AI" brand identity - personality, voice/tone, copy constants, messaging patterns

### Key Components

- **TodayTab.svelte**: Joe Gebbia Option 3 design - chat-first desktop (60%), form-first mobile with toggle
- **QuickEntrySection.svelte**: Unified morning/evening forms (collapsible on desktop, expanded on mobile)
- **ChatInterface.svelte**: Voice-first text input with auto-scroll and keyboard shortcuts
- **ExtractionPreview.svelte**: Shows extracted data before save, builds trust through transparency
- **QuoteHeader.svelte**: Daily ZenQuotes inspiration with retry on error
- **WeeklyPrioritiesSidebar.svelte**: Progress bars for weekly priorities
- **CoachChallenge.svelte**: AI mentor insights (Bill Campbell, Machiavelli, Peter Drucker, etc.)
- **Shared Components**: Button, Input, Card, CollapsibleSection (all ≥44px touch targets)

### Data Flow

**Voice-First Entry Creation**:

1. User pastes voice transcript or types in ChatInterface
2. POST to `/api/extract-entry` with text + existing data
3. Claude extracts: sleep, energy, habits, intentions, gratitude, food, tags, people, frameworks
4. ExtractionPreview shows extracted data (progressive disclosure)
5. User reviews, optionally edits in QuickEntrySection forms
6. Click "Save Entry" → POST to `/api/entries/[date]`
7. API writes YAML frontmatter + markdown body to amk-journal repo
8. Success alert, chat cleared for next entry

**Cross-Repository Persistence**:

- Command Center (SvelteKit) → amk-journal (markdown files)
- API routes use `fs.writeFileSync()` with absolute paths
- YAML normalization ensures YYYY-MM-DD date format

_Last updated: 2026-02-11_

---

## Gotchas (Hard-Won Learnings)

- **Svelte 5 `@const` placement**: Must be immediate child of control flow blocks (`{#if}`, `{:else}`, `{#each}`), not inside regular `<div>` elements
- **Svelte 5 `$effect` lifecycle**: Cannot use `$effect()` at module level - must be inside component lifecycle. Create separate component (e.g., `PersistenceManager.svelte`) to run effects
- **Svelte 5 state export pattern**: Cannot export directly reassigned `$state` variables. Use object wrapper: `export const dataStore = $state({ contacts: [...], interactions: [...] })`
- **Svelte 5 array mutations in `$derived`**: `.sort()` mutates array and causes `state_unsafe_mutation` error. Use `.toSorted()` instead (non-mutating)
- **Svelte 5 `state_unsafe_mutation`**: Reading and writing same state in `$effect` creates circular dependency. Solution: Wrap state in object, access via `dataStore.contacts` instead of direct `contacts` variable
- **Tailwind JIT dynamic classes**: Template string interpolation breaks JIT compilation (`border-${color}`). Use complete class strings in constants instead
- **Touch targets mobile minimum**: All interactive elements need ≥44px touch target for mobile usability. Use `min-h-[44px]` + adequate padding
- **UX error messages**: Generic errors violate trust. Always provide specific recovery guidance ("Check your connection" vs "Failed")
- **Confirmation dialogs prevent accidents**: Destructive actions (remove items) need `confirm()` dialog - builds user confidence to explore UI
- **Cross-repository file writes**: SvelteKit API routes can write to external repos. Keep base paths in constants for easy config
- **Strategic Intelligence heuristic design**: Pattern matching + scoring beats ML for 80% accuracy at <10ms - simple rules catch obvious biases without API calls
- **Svelte 5 $derived for computed state**: Use `$derived` (simple) or `$derived.by()` (complex) for reactive computations that auto-update when dependencies change
- **Zero-dependency architecture trade-off**: Speed + offline-first > perfect accuracy. 80/20 rule: catch 80% of biases with 20% effort via simple heuristics
- **ROI estimation value parsing**: Regex patterns for R25M, €500K, $1.5M + time savings calculation (30min/day = 182h/year × $100/h = $18,200 value)
- **Contrarian probability scoring**: Base 30% + weak signals (+5% each: could, might) + emotional (+8%: feel, want) + time pressure (+15%: urgent), cap at 85%
- **Vite dev server module caching**: After installing new dependencies, Vite dev server must be restarted to pick up new imports - HMR won't detect new modules in node_modules
- **GitHub Push Protection on API keys**: GitHub blocks pushes containing secrets (API keys). Redact keys in documentation before committing (use `r8_your_key_here` placeholders). Fix: Edit file, amend commit (`git commit --amend --no-edit`), force push
- **Resend-style minimalism**: No gradients, no complex animations (except loading spinners), no decorative elements. Use border-left-4 for alerts, generous spacing, clean typography. Dark-first with midnight-900/800/700 palette
- **Brand identity without over-designing**: Centralize brand constants in `/src/lib/brand/index.ts`. Apply personality through copy/messaging, not flashy visuals. "Nexus AI" subtle branding > robotic AI indicators
- **Team agents for parallel execution**: Launch 7+ agents simultaneously with strict design rules. All agents must complete before verification. Use for large-scale refactors (UI consistency, branding updates)
- **Playwright MCP date navigation closure bug (2026-02-13)**: Event handlers defined inside `$effect` capture stale state values. Moving navigation handlers OUTSIDE `$effect` fixes closure issue. Use direct prop callbacks (`onPrevious`, `onNext`) instead of CustomEvent dispatch for reliability.
- **Claude API JSON markdown wrapping (2026-02-13)**: Claude Sonnet 4.5 sometimes returns JSON wrapped in `json ... ` code blocks. Must strip markdown before `JSON.parse()`. Regex: `jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()`.
- **Multi-agent expert reviews before shipping (2026-02-13)**: Single-perspective testing misses critical issues. Run 4+ parallel expert agents (Joe Gebbia UX, Nir Eyal Hook Model, GTD productivity, Voice-First) to catch P0 blockers. Example findings: habits navigate to wrong tabs, API fails silently, no keyboard shortcuts, 50 min/day wasted.
- **Voice-First requires keyboard shortcuts (2026-02-13)**: Green button clicks fail while driving. MUST add Cmd+Shift+V shortcut + TTS audio confirmations for hands-free usage. Voice coverage target: 80%+ (not 15%). Test: Can entrepreneur use while driving?

_Last updated: 2026-02-13_

---

## Development

### Commands

```bash
npm run dev      # Start dev server (port 5173-5175)
npm run build    # Production build
npm run preview  # Preview production build
```

### File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── CRMTab.svelte          # Contact management
│   │   ├── MetricsTab.svelte      # Habit streaks, energy, sleep
│   │   └── PersistenceManager.svelte  # localStorage auto-save
│   ├── stores/
│   │   └── data.svelte.ts         # Central dataStore with runes
│   └── utils/
│       ├── persistence.svelte.ts  # localStorage helpers
│       └── constants.ts           # Storage keys, config
├── routes/
│   ├── +layout.svelte             # Root layout (mounts PersistenceManager)
│   └── +page.svelte               # Main dashboard
└── app.css                        # Tailwind imports
```

### State Management Pattern

```typescript
// data.svelte.ts - Object wrapper pattern
export const dataStore = $state({
  contacts: loadContacts(),
  interactions: loadInteractions()
});

// PersistenceManager.svelte - Auto-save component
$effect(() => {
  saveToLocalStorage(STORAGE_KEYS.CONTACTS, dataStore.contacts);
});

// Components - Access via dataStore
const filteredContacts = $derived.by(() => {
  return dataStore.contacts.filter(...).toSorted(...);
});
```

---

## UX Principles (Joe Gebbia / Airbnb)

**Overall Score: 22/25 (88%)**

1. ✅ **Belong Anywhere** (5/5): Emojis, personal tagline, warmth in design
2. ✅ **Progressive Disclosure** (5/5): Tab navigation, overview → details on click
3. ⚠️ **Friction-Aware** (4/5): Single-click nav, clear toggles; 23 tags might overwhelm
4. ✅ **Trust Through Transparency** (5/5): Clear metrics, honest comparisons, visible data
5. ⚠️ **Seamless Cross-Platform** (3/5): localStorage works; mobile/PWA untested

---

## Content Ideas

See: `~/Projects/amk-content/articles/ideas.md`

---

## Stack Preferences

- **Package manager**: npm (pnpm not available in this environment)
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS utility classes
- **State**: Svelte 5 runes only (no legacy stores)
