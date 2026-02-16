# localStorage to SDK Migration Plan

## Current State Analysis

### localStorage Usage Inventory

**DATA Storage (should migrate to SDK):**

1. `src/lib/stores/data.svelte.ts` - Contacts & Interactions CRM data
2. `src/lib/api/implementations/localStorage/crm.service.ts` - CRM operations
3. `src/lib/api/implementations/localStorage/planning.service.ts` - Weekly planning
4. `src/lib/api/implementations/localStorage/reviews.service.ts` - Morning/Evening reviews
5. `src/lib/api/implementations/localStorage/storage.service.ts` - Low-level localStorage wrapper
6. `src/lib/components/PersistenceManager.svelte` - Auto-save contacts/interactions

**UI Preferences (keep in localStorage):**

1. `src/lib/stores/session.svelte.ts` - Session state (drafts, last tab, etc.)
2. `src/lib/stores/achievements.ts` - Gamification/achievement tracking
3. `src/lib/stores/user-preferences.ts` - UI settings (theme, language, etc.)
4. `src/lib/stores/action-history.svelte.ts` - Undo/redo history
5. `src/lib/utils/detect-platform.ts` - iOS install prompt dismissed flag
6. `src/lib/utils/decision-tracker.ts` - Decision tracking tool

### SDK Capabilities

**Available in SDK (@amk/command-center-sdk v1.1.0):**

- ✅ `client.people.list()` - Get all people (returns PersonSummary[])
- ✅ `client.people.get(handle)` - Get person details (returns PersonDetail)
- ✅ `client.entries.getContexts()` - Get GTD contexts
- ✅ `client.weekly.current()` - Get current week priorities
- ✅ `client.reviews.getWeeklyData()` - Get weekly review data
- ✅ `client.energy.getCurrent()` - Get current energy level
- ✅ `client.tasks.list()` - Get tasks
- ✅ `client.buyers.list()` - Get M&A buyers (workspace: 'ma')

**NOT Available in SDK:**

- ❌ Full CRUD for contacts (create, update, delete)
- ❌ Full CRUD for interactions (create, delete)
- ❌ Email, phone, notes fields for contacts
- ❌ Interaction summaries, next actions
- ❌ Weekly plan CRUD operations
- ❌ Morning/Evening review CRUD operations

### Type Mismatches

**Local Contact vs SDK PersonSummary:**

```typescript
// Local (amk-command-center)
interface Contact {
  handle: string;
  name: string;
  company?: string;
  email?: string; // ❌ Not in SDK
  phone?: string; // ❌ Not in SDK
  tags: string[];
  notes: string; // ❌ Not in SDK
  created: string; // ❌ Not in SDK
  updated: string; // ❌ Not in SDK
}

// SDK
interface PersonSummary {
  handle: string;
  name: string;
  company?: string;
  tags: string[];
  last_interaction?: string; // ✅ New field
  sentiment?: Sentiment; // ✅ New field
}
```

**Local Interaction vs SDK Interaction:**

```typescript
// Local (amk-command-center)
interface Interaction {
  id: string;
  contact: string;
  date: string;
  summary: string; // ❌ Not in SDK
  next_action?: string; // ❌ Not in SDK
  tags: string[]; // ❌ Not in SDK
  created: string; // ❌ Not in SDK
}

// SDK
interface Interaction {
  date: string;
  context: string; // ✅ Different field
  sentiment: Sentiment; // ✅ Different field
}
```

## Migration Strategy Options

### Option 1: Full Migration (BREAKING CHANGES)

**Approach:** Replace localStorage with SDK completely, update all types to match SDK schema.

**Pros:**

- Clean architecture
- Single source of truth
- Backend-driven data

**Cons:**

- **BREAKS existing CRM data** (Contact.email, phone, notes, Interaction.summary lost)
- Requires backend API changes to support missing fields
- Users lose existing CRM data unless migrated

**Effort:** 2-3 days
**Recommended:** NO (breaks user data)

### Option 2: Hybrid Approach (READ from SDK, WRITE to localStorage)

**Approach:** Read people/interactions from SDK (read-only), keep localStorage for features SDK doesn't support.

**Pros:**

- No data loss
- Gradual migration path
- Works with current backend

**Cons:**

- Complexity (two data sources)
- User confusion (some data editable, some not)
- Still need localStorage for full features

**Effort:** 1-2 days
**Recommended:** MAYBE (if backend will eventually support full schema)

### Option 3: Feature Flag Migration (RECOMMENDED)

**Approach:**

1. Create SDK-based service implementations
2. Add feature flag to switch between localStorage and SDK
3. Default to localStorage until backend supports full schema
4. Migrate incrementally

**Pros:**

- No breaking changes
- Safe rollback
- Incremental migration
- Easy A/B testing

**Cons:**

- Maintenance overhead (two code paths)
- Longer migration timeline

**Effort:** 1-2 days
**Recommended:** YES

### Option 4: Remove CRM Features, Use SDK Only

**Approach:** Remove CRM tab and Contact/Interaction management entirely. Use SDK for people mentions only.

**Pros:**

- Simplest migration
- Clean codebase
- Fully SDK-driven

**Cons:**

- **REMOVES features** users may be using
- No CRM functionality unless backend adds it

**Effort:** < 1 day
**Recommended:** Only if user confirms CRM features not needed

## Recommended Action Plan

### Phase 1: Assessment (30 min)

1. ✅ Audit all localStorage usage
2. ✅ Document SDK capabilities
3. ✅ Identify type mismatches
4. ❓ **ASK USER:** Which migration strategy to use?

### Phase 2: Implementation (depends on strategy)

**If Option 3 (Feature Flag):**

1. Create `src/lib/api/implementations/sdk/` directory
2. Implement SDK-based service classes
3. Add `USE_SDK` environment variable
4. Update service exports to check flag
5. Test both code paths

**If Option 4 (Remove CRM):**

1. Delete CRMTab.svelte
2. Delete StrategicTab.svelte
3. Delete dataStore, PersistenceManager
4. Update navigation to remove CRM links
5. Add people mentions via SDK only

### Phase 3: Testing

1. Test TypeScript compilation
2. Test both localStorage and SDK modes (if Option 3)
3. Verify no data loss
4. Test offline functionality

### Phase 4: Documentation

1. Update README with migration status
2. Document breaking changes (if any)
3. Create migration guide for users

## Immediate Blockers

1. **BLOCKER:** SDK doesn't support full Contact schema (email, phone, notes)
2. **BLOCKER:** SDK doesn't support full Interaction schema (summary, next_action, tags)
3. **BLOCKER:** SDK doesn't support CRUD operations for people/interactions
4. **DECISION NEEDED:** Which migration strategy should we use?

## Questions for User

1. **Is the CRM functionality (contacts with email/phone/notes, interaction tracking) still needed?**
   - If YES → Need backend API changes first
   - If NO → Can remove CRM features and use SDK only

2. **Is the goal to:**
   - a) Fully migrate to backend API (requires backend changes)
   - b) Remove features that aren't in backend
   - c) Keep localStorage for features not in backend (hybrid)
   - d) Feature flag for gradual migration

3. **What about existing user data in localStorage?**
   - Migrate to backend (requires migration script)
   - Export and archive
   - Delete (acceptable data loss)

## Next Steps

**WAITING FOR USER INPUT** on:

- Migration strategy preference (Options 1-4)
- Whether CRM features are still needed
- How to handle existing localStorage data

Once decided, I can proceed with implementation.
