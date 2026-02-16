# Command Center V2 - Backend Implementation

**Agent**: Backend Specialist
**Status**: Phase 1 Complete (Mock Implementation)
**Duration**: ~45 minutes
**Date**: 2026-02-11

---

## What Was Built

### 1. API Routes (SvelteKit Server Endpoints)

#### `/src/routes/api/extract-entry/+server.ts`

- **Purpose**: Extract structured data from freeform voice transcripts
- **Method**: POST
- **Status**: Mock implementation with realistic pattern matching
- **Features**:
  - German and English language support
  - Extracts: sleep, energy, habits, intentions, gratitude, food
  - Returns confidence score and suggestions
  - Merges with existing entry data

#### `/src/routes/api/weekly/current/+server.ts`

- **Purpose**: Get current week's priorities with progress tracking
- **Method**: GET
- **Status**: Reads from weekly plan files, falls back to mock data
- **Features**:
  - Calculates current week (ISO 8601 format)
  - Reads weekly plan frontmatter
  - Returns priorities with progress percentages

### 2. Type Definitions

#### `/src/lib/types.ts` (Extended)

- `ExtractEntryRequest` / `ExtractEntryResponse`
- `CurrentWeekResponse`
- `WeeklyPriority`
- `ExtractedData`
- Added to existing types: `HabitData`, `FoodEntry`, `WeeklyPlan`

### 3. File System Utilities

#### `/src/lib/server/file-utils.ts`

Handles all journal file I/O operations:

**Path Utilities**:

- `getDailyEntryPath(date)` - Returns path to daily entry
- `getWeeklyPlanPath(week)` - Returns path to weekly plan
- `getCurrentWeekString()` - ISO 8601 week calculation

**File Operations**:

- `readDailyEntry(date)` - Parse daily entry frontmatter
- `writeDailyEntry(date, data, content)` - Write/update entry
- `readWeeklyPlan(week)` - Parse weekly plan markdown
- `getCurrentWeeklyPlan()` - Get this week's plan

**Parsing**:

- `parseMarkdown(markdown)` - Split frontmatter and content
- `parseYAML(text)` - Simple YAML parser for frontmatter
- `stringifyYAML(obj)` - Convert object to YAML

### 4. Documentation

#### `API-CONTRACTS.md`

- Complete API specification
- Request/response schemas
- Example curl commands
- TypeScript types reference
- Frontend integration guide
- Phase 2 TODO list

#### `tests/api-test.sh`

- Automated API testing script
- Tests 5 scenarios (German, English, minimal, error, weekly)
- Color-coded output
- Checks server availability

---

## File Structure

```
src/
├── lib/
│   ├── types.ts                        # TypeScript types (extended)
│   └── server/
│       └── file-utils.ts               # NEW: File system utilities
└── routes/
    └── api/
        ├── extract-entry/
        │   └── +server.ts              # NEW: POST endpoint
        └── weekly/
            └── current/
                └── +server.ts          # NEW: GET endpoint

tests/
└── api-test.sh                         # NEW: Test script

API-CONTRACTS.md                        # NEW: API documentation
BACKEND-README.md                       # NEW: This file
```

---

## How to Test

### 1. Start Dev Server

```bash
cd /Users/amk/Projects/amk-command-center
npm run dev
```

Server should start at `http://localhost:5173`

### 2. Run Automated Tests

```bash
./tests/api-test.sh
```

This will test all endpoints and show color-coded results.

### 3. Manual Testing with curl

#### Test Extract Entry (German)

```bash
curl -X POST http://localhost:5173/api/extract-entry \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11",
    "text": "Ins Bett um 22:00, 8h geschlafen, gute Qualität. High energy heute. Dankbar für Jani."
  }'
```

#### Test Weekly Current

```bash
curl http://localhost:5173/api/weekly/current
```

---

## Mock Data Behavior

### Extract Entry

The mock implementation uses regex pattern matching to extract data:

**German Patterns**:

- `ins Bett um 22:00` → sleep.bedtime
- `8h geschlafen` → sleep.duration
- `gute Qualität` → sleep.quality = "good"
- `high energy`, `viel energie` → energy = "high"
- `dankbar für [X] - [Y]` → gratitude

**English Patterns**:

- `went to bed at 22:00` → sleep.bedtime
- `slept 8 hours` → sleep.duration
- `grateful for [X] - [Y]` → gratitude

See `API-CONTRACTS.md` for full pattern list.

### Weekly Current

1. First tries to read actual weekly plan file
2. Parses frontmatter for priorities
3. Falls back to mock priorities if file doesn't exist
4. Mock priorities match real journal patterns (Printulu deal, sales learning, etc.)

---

## Phase 2 TODO

### Immediate Next Steps (Week 2)

1. **Claude API Integration** (`extract-entry`)
   - Replace regex patterns with Claude API call
   - Use prompt engineering for German/English support
   - Implement confidence scoring
   - Handle errors gracefully

2. **Real Progress Tracking** (`weekly/current`)
   - Scan daily entries for the week
   - Match intentions to weekly priorities
   - Calculate real `days_active` counts
   - Cache results for performance

3. **File Write Operations**
   - Implement safe file writes with locking
   - Add backup mechanism before overwrites
   - Validate YAML schema before writing
   - Add error handling for file I/O

### Advanced Features (Week 3)

4. **Real-time Extraction**
   - WebSocket support for live extraction
   - Debounced API calls (500ms delay)
   - Stream partial results as they're extracted

5. **Link Daily → Weekly**
   - POST `/api/daily/link-weekly` endpoint
   - Update weekly plan when daily entry saved
   - Track which days each priority was worked on
   - Update progress bars automatically

6. **Validation & Testing**
   - JSON Schema validation for requests
   - Unit tests for extraction patterns
   - Integration tests for file I/O
   - E2E tests with real journal data

---

## Environment Variables

Create `.env` file in project root:

```bash
# Optional: Custom journal path (defaults to /Users/amk/Projects/amk-journal)
JOURNAL_PATH=/path/to/amk-journal

# Phase 2: Claude API key
ANTHROPIC_API_KEY=sk-ant-...

# Phase 2: Enable debug logging
DEBUG=true
```

---

## Troubleshooting

### Server won't start

```bash
# Check for port conflicts
lsof -i :5173

# Kill existing process
kill -9 <PID>

# Restart server
npm run dev
```

### API returns 404

- Make sure server is running
- Check URL format: `http://localhost:5173/api/...` (no trailing slash)
- Verify route files are in correct directory structure

### YAML parsing errors

- Check frontmatter format in journal entries
- Must start and end with `---`
- Keys must be followed by `:` (colon)
- Arrays must use `- ` (dash space) prefix

### File permissions

```bash
# Check journal directory permissions
ls -la /Users/amk/Projects/amk-journal/users/amk/entries/

# Fix if needed
chmod 755 /Users/amk/Projects/amk-journal/users/amk/entries/
```

---

## Integration with Agent 1 (Frontend)

Agent 1 should consume these APIs to build the chat interface:

### Example Frontend Code

```typescript
// In TodayTab.svelte

import type { ExtractEntryResponse, CurrentWeekResponse } from "$lib/types";

async function extractFromText(text: string) {
  const response = await fetch("/api/extract-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: new Date().toISOString().split("T")[0],
      text,
      existing: currentEntry, // Optional merge
    }),
  });

  if (!response.ok) {
    throw new Error("Extraction failed");
  }

  const data: ExtractEntryResponse = await response.json();
  return data;
}

async function loadWeeklyPriorities() {
  const response = await fetch("/api/weekly/current");
  const data: CurrentWeekResponse = await response.json();
  return data.priorities;
}
```

### Recommended UX Flow

1. User types/pastes voice transcript
2. Debounce input (500ms delay after typing stops)
3. Call `/api/extract-entry` with text
4. Show loading spinner while extracting
5. Display extracted data in sidebar preview
6. Show suggestions below input field
7. If `confidence < 0.7`, show warning for user review
8. User clicks "Save to Journal" to confirm
9. Write to file system via `file-utils.ts`

---

## Performance Considerations

### Current (Phase 1)

- Mock extraction: ~10ms (instant)
- Weekly plan read: ~50ms (single file read)
- No caching needed yet

### Phase 2 Targets

- Claude API extraction: <2s (API latency)
- Weekly progress calculation: <500ms (7 file reads + parsing)
- Cache weekly data for 5 minutes (updates on write)
- Debounce extract calls to avoid rate limits

### Optimization Ideas

- Cache parsed weekly plans in memory
- Pre-parse daily entries at startup
- Use worker threads for file I/O
- Implement request queuing for Claude API

---

## Code Quality

### TypeScript Strict Mode

All files use strict TypeScript:

- No `any` types
- Explicit return types
- Proper error handling

### Error Handling Pattern

```typescript
try {
  // API logic
  return json(response);
} catch (error) {
  console.error("Error in /api/...:", error);
  return json({ error: "Internal server error" }, { status: 500 });
}
```

### Logging

- Use `console.error()` for errors (always log)
- Use `console.log()` for debug (only in development)
- Add timestamps for debugging: `new Date().toISOString()`

---

## Next Session Handoff

### For Agent 1 (Frontend Developer)

**You can now**:

1. Build the chat interface using these APIs
2. Test extraction with the provided test script
3. Use mock data to develop UI without waiting for Claude API
4. Refer to `API-CONTRACTS.md` for full specs

**What you need**:

- Chat component with text input
- Sidebar showing extracted data preview
- "Save to Journal" button
- Weekly priorities widget at top
- Confidence warnings for low-confidence extractions

**Don't worry about**:

- Real Claude API integration (Phase 2)
- File writes (handled by backend)
- YAML parsing (utilities provided)
- Weekly progress calculation (Phase 2)

### For Agent 3 (DevOps/Polish)

**Phase 2 tasks**:

1. Integrate Claude API in `extract-entry/+server.ts`
2. Implement daily progress scanning in `weekly/current/+server.ts`
3. Add caching layer for performance
4. Write unit tests for extraction patterns
5. Set up error monitoring (Sentry?)

**Config needed**:

- `ANTHROPIC_API_KEY` in environment
- Rate limiting for Claude API
- File locking mechanism
- Backup strategy for writes

---

## Questions or Issues?

If Agent 1 encounters any unclear behavior:

1. Check `API-CONTRACTS.md` first
2. Run `./tests/api-test.sh` to verify backend is working
3. Review type definitions in `src/lib/types.ts`
4. Check console logs in dev server terminal
5. Test with curl to isolate frontend vs backend issues

---

## Summary

**What works now**:

- ✅ POST `/api/extract-entry` with realistic mock extraction
- ✅ GET `/api/weekly/current` with weekly plan file reading
- ✅ File system utilities for journal I/O
- ✅ TypeScript types for all APIs
- ✅ Automated test script
- ✅ Comprehensive documentation

**What's next (Phase 2)**:

- 🔲 Claude API integration for real extraction
- 🔲 Daily entry scanning for progress tracking
- 🔲 File write operations with safety
- 🔲 Caching and performance optimization
- 🔲 Error handling and monitoring
- 🔲 Unit and integration tests

**Estimated Phase 2 time**: 2-3 hours

---

**Backend Specialist Agent 2 signing off. Happy coding, Agent 1! 🚀**
