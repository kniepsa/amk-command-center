# localStorage Audit & Migration Plan

## Executive Summary

**Goal**: Eliminate ALL localStorage data storage, keeping only UI preferences
**Status**: Ready for migration after Agents 10-13 complete

---

## Category 1: DATA (Must Remove - Use Backend API)

### 1.1 Contacts & Interactions

- **File**: `src/lib/stores/data.svelte.ts`
- **Keys**: `amk-contacts`, `amk-interactions`
- **Action**: ✅ ALREADY MIGRATED by Agent 10-13
- **SDK Methods**: `client.contacts.*`, `client.interactions.*`

### 1.2 Decision Tracker

- **File**: `src/lib/utils/decision-tracker.ts`
- **Key**: `amk-decisions`
- **Action**: REMOVE - Create backend endpoint `/api/decisions`
- **Functions to migrate**:
  - `saveDecision()` → `POST /api/decisions`
  - `getAllDecisions()` → `GET /api/decisions`
  - `updateDecisionOutcome()` → `PUT /api/decisions/:id/outcome`
  - `deleteDecision()` → `DELETE /api/decisions/:id`

### 1.3 Persistence Utils (Generic Data)

- **File**: `src/lib/utils/persistence.svelte.ts`
- **Keys**: Multiple (via `saveToLocalStorage()`)
- **Used by**: Morning reviews, evening reviews, weekly plans
- **Action**: REMOVE entire file - replace with SDK calls

---

## Category 2: UI PREFERENCES (Keep)

### 2.1 User Preferences

- **File**: `src/lib/stores/user-preferences.ts`
- **Key**: `amk-command-center-preferences`
- **Contains**:
  - People mapping (nickname → handle)
  - Voice command shortcuts
  - Warren Buffett Top 5
  - Peak energy hours
  - Preferred coach
  - Activity counters
- **Action**: KEEP (UI preferences, not data)

### 2.2 Session State

- **File**: `src/lib/stores/session.svelte.ts`
- **Key**: `session-state`
- **Contains**:
  - Last tab visited
  - Current date
  - Draft entry (transient)
  - Draft transcript (transient)
  - Last habits toggled
  - Last context filter
- **Action**: KEEP (transient session data, not persistent data)

### 2.3 Platform Detection

- **File**: `src/lib/utils/detect-platform.ts`
- **Key**: `ios-install-prompt-dismissed`
- **Action**: KEEP (UI preference)

---

## Category 3: FEATURES (Evaluate)

### 3.1 Action History (Undo/Redo)

- **File**: `src/lib/stores/action-history.svelte.ts`
- **Key**: `action-history`
- **Current**: Stores history in localStorage (but reverseAction functions don't persist)
- **Action**: KEEP (session-only, already clears on page refresh)

### 3.2 Achievements

- **File**: `src/lib/stores/achievements.ts`
- **Key**: `amk-command-center-achievements`
- **Current**: Stores unlocked achievements
- **Action**: MIGRATE to backend (user profile data)
- **Backend**: Add `achievements` table linked to user

---

## Category 4: ABSTRACTION LAYERS (Remove)

### 4.1 LocalStorage Service

- **File**: `src/lib/api/implementations/localStorage/storage.service.ts`
- **Action**: DELETE entire file (no longer needed)

---

## Migration Plan

### Phase 1: Backend Endpoints (30 min)

1. Create decisions endpoint in `.claude/api`
2. Create achievements endpoint in `.claude/api`
3. Add to SDK package

### Phase 2: Remove Data localStorage (2 hours)

1. Replace `decision-tracker.ts` with SDK calls
2. Delete `persistence.svelte.ts`
3. Update components using these utilities

### Phase 3: Migration UI (1 hour)

1. Create one-time migration modal
2. Upload existing localStorage data to backend
3. Clear localStorage after successful migration

### Phase 4: Cleanup (30 min)

1. Delete `storage.service.ts`
2. Remove unused imports
3. Update documentation

---

## Files to DELETE

```
src/lib/utils/persistence.svelte.ts (entire file)
src/lib/api/implementations/localStorage/storage.service.ts (entire file)
```

## Files to MODIFY

```
src/lib/utils/decision-tracker.ts → Replace with SDK calls
src/lib/stores/achievements.ts → Replace with SDK calls
src/lib/stores/data.svelte.ts → Remove localStorage loading (already done by Agent 10-13?)
```

## Files to KEEP (No changes)

```
src/lib/stores/user-preferences.ts (UI preferences)
src/lib/stores/session.svelte.ts (transient session)
src/lib/stores/action-history.svelte.ts (session-only undo)
src/lib/utils/detect-platform.ts (UI preference)
src/lib/stores/offline-queue.ts (uses IndexedDB, not localStorage)
```

---

## Final localStorage Audit (Target State)

### Allowed Keys

- `amk-command-center-preferences` (user preferences)
- `session-state` (transient session)
- `action-history` (session-only undo)
- `ios-install-prompt-dismissed` (UI preference)

### Forbidden Keys (Must be in backend)

- ❌ `amk-contacts`
- ❌ `amk-interactions`
- ❌ `amk-decisions`
- ❌ `amk-morning-reviews`
- ❌ `amk-evening-reviews`
- ❌ `amk-weekly-plans`
- ❌ `amk-command-center-achievements`

---

## Testing Checklist

- [ ] Decision tracking works via API
- [ ] Achievements sync across devices
- [ ] Migration modal uploads all old data
- [ ] localStorage only contains UI preferences
- [ ] No data loss during migration
- [ ] Offline mode still queues requests (IndexedDB)
