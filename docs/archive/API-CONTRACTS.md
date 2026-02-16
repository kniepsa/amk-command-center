# AMK Command Center V2 - API Contracts

**Status**: Phase 1 (Mock Implementation)
**Last Updated**: 2026-02-11

---

## Overview

This document defines the API contracts for Command Center V2, enabling chat-first daily entry and weekly planning features.

**Implementation Status**:

- Phase 1: Mock implementations with realistic data (COMPLETE)
- Phase 2: Claude API integration for extraction (TODO)
- Phase 3: Real-time sync with journal file system (TODO)

---

## Endpoints

### 1. POST `/api/extract-entry`

Extracts structured data from freeform text (voice transcripts or typed input).

#### Request

```typescript
{
  date: string;              // YYYY-MM-DD format (required)
  text: string;              // Raw voice transcript or typed text (required)
  existing?: {               // Optional partial entry data to merge with
    sleep?: { ... };
    energy?: "high" | "medium" | "low" | "drained";
    habits?: { ... };
    intentions?: string[];
    gratitude?: Array<{ thing: string; why: string }>;
    food?: Array<{ time: string; meal: string; ... }>;
  }
}
```

#### Response (200 OK)

```typescript
{
  extracted: {
    sleep?: {
      bedtime?: string;        // HH:MM format
      wake_time?: string;      // HH:MM format
      duration?: string;       // Hours (e.g., "8.0")
      quality?: "excellent" | "good" | "fair" | "poor";
      blue_blockers?: boolean;
      screen_curfew?: boolean;
    };
    energy?: "high" | "medium" | "low" | "drained";
    habits?: {
      running?: boolean;
      sauna?: boolean;
      sales_learning?: boolean;
      journaling?: boolean;
      three_daily_happiness?: boolean;
      vampire_shot?: boolean;
      morning_electrolytes?: boolean;
      supplements?: boolean;
      plan_tomorrow?: boolean;
      plan_next_week?: boolean;
    };
    intentions?: string[];
    gratitude?: Array<{
      thing: string;
      why: string;
    }>;
    food?: Array<{
      time: string;            // HH:MM format
      meal: string;            // Description
      portion_grams?: number[];
      usda_ids?: string[];
    }>;
  };
  confidence: number;          // 0.0 to 1.0 (extraction confidence)
  suggestions?: string[];      // Helpful suggestions for user
}
```

#### Error Response (400/500)

```typescript
{
  error: string; // Error message
}
```

#### Example Usage

```bash
curl -X POST http://localhost:5173/api/extract-entry \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11",
    "text": "Ins Bett um 22:00, 8h geschlafen, gute Qualität. High energy heute. Dankbar für Jani - sie hat mir Zeit gegeben zu arbeiten. Gegessen um 12:00 300g Joghurt mit Beeren."
  }'
```

#### Extraction Patterns (Phase 1 Mock)

The mock implementation recognizes these patterns:

**Sleep**:

- `ins Bett um 22:00` → bedtime
- `aufgewacht um 06:00` → wake_time
- `8h geschlafen` → duration
- `gute Qualität` → quality: "good"

**Energy**:

- `high energy`, `viel energie` → "high"
- `medium energy`, `ok energie` → "medium"
- `low energy`, `wenig energie` → "low"
- `drained`, `erschöpft` → "drained"

**Habits**:

- `laufen`, `running` → running: true
- `sauna` → sauna: true
- `sales learning`, `vertriebstraining` → sales_learning: true
- `elektrolyte`, `electrolytes` → morning_electrolytes: true

**Intentions**:

- `intention: [text]`
- `heute will ich [text]`
- `focus: [text]`

**Gratitude**:

- `dankbar für [thing] - [why]`
- `grateful for [thing] - [why]`

**Food**:

- `gegessen um 12:00 300g Joghurt`
- `ate at 12:00 salmon`
- `12:00 Uhr 300g Joghurt gegessen`

---

### 2. GET `/api/weekly/current`

Returns current week's priorities with progress tracking.

#### Request

No parameters required.

#### Response (200 OK)

```typescript
{
  week: string; // e.g., "2026-W06"
  priorities: Array<{
    id: string; // e.g., "w06-p1"
    text: string; // Priority description
    days_active: number; // How many days this week worked on it
    total_days: number; // Total days in week (usually 7)
    progress_percent: number; // days_active / total_days * 100
    status?: "in_progress" | "completed" | "blocked" | "dropped";
  }>;
}
```

#### Error Response (500)

```typescript
{
  error: string; // Error message
}
```

#### Example Usage

```bash
curl http://localhost:5173/api/weekly/current
```

#### Example Response

```json
{
  "week": "2026-W06",
  "priorities": [
    {
      "id": "2026-W06-p1",
      "text": "Close Printulu deal (Leon/Jerome/Abdul)",
      "days_active": 2,
      "total_days": 7,
      "progress_percent": 29,
      "status": "in_progress"
    },
    {
      "id": "2026-W06-p2",
      "text": "Sales learning Day 8-14 (SPIN framework)",
      "days_active": 2,
      "total_days": 7,
      "progress_percent": 29,
      "status": "in_progress"
    },
    {
      "id": "2026-W06-p3",
      "text": "Plan Germany real estate pitch (Hulisani)",
      "days_active": 0,
      "total_days": 7,
      "progress_percent": 0,
      "status": "in_progress"
    }
  ]
}
```

#### Data Sources (Phase 1)

- **If weekly plan exists**: Reads from `/users/amk/weekly-plans/YYYY-WXX.md`
- **If no weekly plan**: Returns mock priorities
- **Phase 2**: Will scan daily entries to calculate real progress

---

## TypeScript Types

All types are defined in `/src/lib/types.ts`:

```typescript
export interface ExtractEntryRequest { ... }
export interface ExtractEntryResponse { ... }
export interface CurrentWeekResponse { ... }
export interface WeeklyPriority { ... }
```

See `src/lib/types.ts` for full type definitions.

---

## File System Integration

### Utilities (`src/lib/server/file-utils.ts`)

Helper functions for reading/writing journal entries:

```typescript
// Daily entries
getDailyEntryPath(date: string): string
readDailyEntry(date: string): Promise<HabitData | null>
writeDailyEntry(date: string, data: Partial<HabitData>, content?: string): Promise<void>

// Weekly plans
getWeeklyPlanPath(week: string): string
readWeeklyPlan(week: string): Promise<ParsedMarkdown | null>
getCurrentWeeklyPlan(): Promise<ParsedMarkdown | null>

// Utilities
getCurrentWeekString(): string
fileExists(path: string): Promise<boolean>
parseMarkdown(markdown: string): ParsedMarkdown
stringifyYAML(obj: Record<string, unknown>, indent?: number): string
```

### File Paths

- **Daily entries**: `/Users/amk/Projects/amk-journal/users/amk/entries/YYYY-MM-DD.md`
- **Weekly plans**: `/Users/amk/Projects/amk-journal/users/amk/weekly-plans/YYYY-WXX.md`
- **Base path**: Configurable via `JOURNAL_PATH` environment variable

---

## Testing

### Manual Testing with curl

```bash
# Test extract-entry
curl -X POST http://localhost:5173/api/extract-entry \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-02-11","text":"Ins Bett um 22:00, 8h geschlafen"}'

# Test weekly/current
curl http://localhost:5173/api/weekly/current
```

### Expected Behavior (Phase 1)

- Both endpoints return 200 OK with mock data
- Extract-entry recognizes common patterns (German and English)
- Weekly/current returns 5 example priorities
- No actual file I/O happens yet (mock data only)

---

## Phase 2 TODO

### Extract Entry Endpoint

- [ ] Integrate Claude API for real extraction
- [ ] Add German language model support
- [ ] Improve extraction patterns (regex → AI)
- [ ] Handle complex voice transcripts (interruptions, corrections)
- [ ] Add confidence scoring based on pattern matches

### Weekly Current Endpoint

- [ ] Read real weekly plan files from disk
- [ ] Parse YAML frontmatter for priorities
- [ ] Scan daily entries for progress tracking
- [ ] Calculate days_active by matching intentions to priorities
- [ ] Cache results for performance

### File Utilities

- [ ] Add error handling for file I/O
- [ ] Implement YAML schema validation
- [ ] Add file locking for concurrent writes
- [ ] Create backup mechanism before writes
- [ ] Add logging for debugging

---

## Frontend Integration

Agent 1 (Frontend) should consume these APIs like this:

```typescript
// Extract entry from user input
const response = await fetch("/api/extract-entry", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    date: "2026-02-11",
    text: userInput,
    existing: existingData, // Optional merge
  }),
});

const { extracted, confidence, suggestions } = await response.json();

// Get current week's priorities
const weekResponse = await fetch("/api/weekly/current");
const { week, priorities } = await weekResponse.json();
```

---

## Environment Variables

```bash
# Optional: Custom journal path (defaults to /Users/amk/Projects/amk-journal)
JOURNAL_PATH=/path/to/amk-journal

# Phase 2: Claude API key for extraction
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Notes for Agent 1 (Frontend)

1. **Mock data is realistic**: The extract-entry endpoint returns mock data that matches real journal patterns.

2. **Error handling**: Always check response status and handle errors gracefully.

3. **Debouncing**: Consider debouncing extract-entry calls (e.g., 500ms delay after user stops typing).

4. **Confidence threshold**: Show warnings if `confidence < 0.7` to let user review extraction.

5. **Suggestions**: Display `suggestions[]` as helpful tips below the input field.

6. **Weekly priorities**: Use `progress_percent` to show visual progress bars.

7. **Date format**: Always use ISO 8601 format (`YYYY-MM-DD`) for dates.

8. **Merge behavior**: When passing `existing` data, it will be merged with newly extracted data (new data takes precedence).

---

## Questions for Agent 1

Please clarify any unclear API behavior before implementing the frontend. Some open questions:

- Should extraction happen on every keystroke (debounced) or on-demand (button click)?
- How should we handle low confidence extractions (< 0.7)?
- Should we allow manual editing of extracted data before saving?
- What UI feedback should we show while extraction is in progress?
