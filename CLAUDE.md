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
[User] → [SvelteKit Routes] → [Svelte 5 Stores] → [localStorage]
                ↓
         [PersistenceManager]
                ↓
         Auto-save on changes
```

### Key Components

- **PersistenceManager.svelte**: Global component that runs `$effect` to auto-save state to localStorage
- **dataStore** (data.svelte.ts): Central reactive store using object wrapper pattern
- **Tabs**: Morning, Evening, Weekly, Personal CRM, Metrics

### Data Flow

1. User interacts with UI (CRM tab, metrics tab, etc.)
2. Changes update `dataStore.contacts` or `dataStore.interactions`
3. `PersistenceManager` detects changes via `$effect`
4. `saveToLocalStorage()` persists to browser storage
5. On page load, `loadContacts()` and `loadInteractions()` restore from localStorage

_Last updated: 2026-02-11_

---

## Gotchas (Hard-Won Learnings)

- **Svelte 5 `@const` placement**: Must be immediate child of control flow blocks (`{#if}`, `{:else}`, `{#each}`), not inside regular `<div>` elements
- **Svelte 5 `$effect` lifecycle**: Cannot use `$effect()` at module level - must be inside component lifecycle. Create separate component (e.g., `PersistenceManager.svelte`) to run effects
- **Svelte 5 state export pattern**: Cannot export directly reassigned `$state` variables. Use object wrapper: `export const dataStore = $state({ contacts: [...], interactions: [...] })`
- **Svelte 5 array mutations in `$derived`**: `.sort()` mutates array and causes `state_unsafe_mutation` error. Use `.toSorted()` instead (non-mutating)
- **Svelte 5 `state_unsafe_mutation`**: Reading and writing same state in `$effect` creates circular dependency. Solution: Wrap state in object, access via `dataStore.contacts` instead of direct `contacts` variable

_Last updated: 2026-02-11_

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
