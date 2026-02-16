# Coach System Backend Migration

**Date**: 2026-02-15
**Status**: ✅ Complete

## Decision: Migrate to Backend

### Rationale

The coach configuration system was migrated to the backend for the following reasons:

1. **Multi-device sync**: Coach preferences should persist across devices
2. **Workspace-specific settings**: Different workspaces (AMK personal, M&A tracker) need different coach configurations
3. **Existing infrastructure**: Workspaces table already has `settings` JSON blob for this purpose
4. **Architecture consistency**: Other user settings (timezone, language) are already backend-persisted

## Implementation

### Backend

**File**: `/Users/amk/Projects/amk-journal/.claude/api/routes/v1/coaches.ts`

**Endpoints**:

- `GET /api/v1/coaches/config?workspace_id=amk` - Get coach configuration for workspace
- `PUT /api/v1/coaches/config` - Update coach configuration (requires workspace_id + config in body)
- `GET /api/v1/coaches/daily` - Get daily coach recommendations (demo data)

**Storage**: Coach settings stored in `workspaces.settings` JSON blob:

```json
{
  "coaches": {
    "active_coaches": [...],
    "settings": {...}
  }
}
```

**Validation**: Full Zod schema validation for:

- Challenge levels (low/medium/high)
- Coach configuration structure
- Settings constraints (max_coaches_per_response 1-10)

### Frontend

**Client Library**: `/Users/amk/Projects/amk-command-center/src/lib/api/journal-client.ts`

**New Functions**:

- `getCoachConfig(workspaceId: string)` - Fetch coach configuration
- `updateCoachConfig(workspaceId: string, config: CoachesConfig)` - Save configuration
- `getDailyCoaches()` - Get daily recommendations

**Updated Components**:

1. `DailyCoachChallenges.svelte` - Uses `getDailyCoaches()`
2. `settings/coaches/+page.svelte` - Uses `getCoachConfig()` and `updateCoachConfig()`
3. `TodayTab.svelte` - Uses `getCoachConfig()` for trigger detection

### Legacy Routes (Deprecated)

**Marked for deletion after verification**:

- `/Users/amk/Projects/amk-command-center/src/routes/api/coaches/config/+server.ts`
- `/Users/amk/Projects/amk-command-center/src/routes/api/coaches/daily/+server.ts`

These routes are kept for backward compatibility but include deprecation notices.

## Testing

### TypeScript Compilation

**Backend**: ✅ Passes

```bash
cd /Users/amk/Projects/amk-journal/.claude/api && npx tsc --noEmit
```

**Frontend**: ⚠️ Pre-existing errors unrelated to migration

- CoachChallenge type conflict between `coach.ts` and `coach-detector.ts` (existed before migration)
- Other errors in glass UI components (existed before migration)

### Manual Testing Required

1. **Config Load**: Visit `/settings/coaches` and verify configuration loads
2. **Config Save**: Modify coach settings and save - verify persists to database
3. **Daily Coaches**: Check Today tab displays daily coach recommendations
4. **Trigger Detection**: Enter text with coach triggers (e.g., "M&A deal") and verify coach activates

## Architecture Benefits

### Before (Local File)

```
Frontend → ~/.config/command-center/coaches.json
```

- ❌ No multi-device sync
- ❌ Not workspace-aware
- ❌ File permission issues possible
- ❌ No centralized management

### After (Backend Database)

```
Frontend → Backend API → Database (workspaces.settings)
```

- ✅ Multi-device sync
- ✅ Workspace-specific settings
- ✅ Centralized management
- ✅ Type-safe validation
- ✅ Consistent with other settings

## Workspace Configuration

Default workspace: `amk`

To add workspace-specific coach configs:

```typescript
// Different configs for different workspaces
await updateCoachConfig("amk", personalCoachConfig);
await updateCoachConfig("ma", maTrackerCoachConfig);
```

## Database Schema

No migration required - uses existing `workspaces.settings` JSON column:

```sql
-- Existing schema (no changes needed)
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  settings TEXT,  -- JSON blob - coaches stored here
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## Rollback Plan

If issues arise:

1. Revert frontend components to use local `/api/coaches/*` routes
2. Remove backend routes from `routes/v1/coaches.ts`
3. Remove registration from `routes/v1/index.ts`

Local routes still exist and functional (deprecated but working).

## Next Steps

1. ✅ Backend implementation
2. ✅ Frontend migration
3. ✅ TypeScript compilation
4. ⏳ Manual testing (pending user verification)
5. ⏳ Delete legacy routes (after 1 week of verification)
6. ⏳ Fix pre-existing CoachChallenge type conflict (separate task)

## Files Changed

**Backend**:

- `routes/v1/coaches.ts` (new)
- `routes/v1/index.ts` (registered coaches routes)

**Frontend**:

- `src/lib/api/journal-client.ts` (added coach functions)
- `src/lib/components/DailyCoachChallenges.svelte` (use backend)
- `src/lib/components/TodayTab.svelte` (use backend)
- `src/routes/settings/coaches/+page.svelte` (use backend)
- `src/routes/api/coaches/config/+server.ts` (deprecated)
- `src/routes/api/coaches/daily/+server.ts` (deprecated)

**Total**: 7 files modified, 1 file created
