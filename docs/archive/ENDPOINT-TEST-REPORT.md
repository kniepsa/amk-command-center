# Voice Journal API Endpoint Test Report

**Date**: 2026-02-11
**Task**: Verify and document voice journal API endpoints

---

## Summary

Both required endpoints **exist** and have been **enhanced** with work_log extraction:

1. `/api/extract-entry` - POST endpoint for extracting structured data
2. `/api/entries/[date]` - POST/GET endpoints for saving/reading journal entries

### Key Enhancements Made

1. **Added work_log extraction** to ExtractedData type
2. **Added tags, people, frameworks, contexts** extraction
3. **Implemented pattern matching** for "worked on X for Y time"

---

## Endpoint 1: `/api/extract-entry`

**Location**: `src/routes/api/extract-entry/+server.ts`
**Method**: POST
**Status**: ✅ Exists and Enhanced

### Request Format

```typescript
{
  date: string;        // YYYY-MM-DD format
  text: string;        // Raw voice transcript or typed text
  existing?: Partial<HabitData>;  // Optional existing data to merge
}
```

### Response Format

```typescript
{
  extracted: ExtractedData;
  confidence: number;     // 0.0 to 1.0
  suggestions?: string[]; // Helpful suggestions
}
```

### ExtractedData Fields

```typescript
interface ExtractedData {
  sleep?: {
    bedtime?: string; // HH:MM
    wake_time?: string; // HH:MM
    duration?: string; // "8h" or "7.5h"
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
  gratitude?: Array<{ thing: string; why: string }>;
  food?: Array<{
    time: string; // HH:MM
    meal: string;
    portion_grams?: number[];
    usda_ids?: string[];
  }>;
  work_log?: Array<{
    // NEW
    thread: string; // Linked thread file
    time_spent: string | null; // "90min" or "2h"
    progress: string | null;
  }>;
  tags?: string[]; // NEW - from #hashtag
  people?: string[]; // NEW - from @handle
  frameworks?: string[]; // NEW - from [[framework]]
  contexts?: Array<
    "calls" | "online" | "office" | "home" | "anywhere" | "waiting"
  >; // NEW
}
```

### Extraction Patterns

#### Sleep

- `ins bett um 23:00` → bedtime: "23:00"
- `aufgewacht um 07:30` → wake_time: "07:30"
- `8h geschlafen` → duration: "8"
- `gute qualität` → quality: "good"

#### Energy

- `high energy`, `viel energie` → "high"
- `medium energy`, `ok energie` → "medium"
- `low energy`, `wenig energie` → "low"
- `drained`, `erschöpft` → "drained"

#### Habits

- `laufen`, `running` → running: true
- `sauna` → sauna: true
- `elektrolyte`, `electrolytes` → morning_electrolytes: true

#### Gratitude

- `dankbar für X - Y` → { thing: "X", why: "Y" }
- `grateful for X - Y` → { thing: "X", why: "Y" }

#### Food

- `gegessen um 12:00 300g Joghurt` → { time: "12:00", meal: "Joghurt", portion_grams: [300] }
- `ate at 12:00 Salad` → { time: "12:00", meal: "Salad" }

#### Work Log (NEW)

- `90 minutes on printulu` → { thread: "printulu", time_spent: "90min", progress: null }
- `worked on leon deal 2h` → { thread: "leon-deal", time_spent: "2h", progress: null }
- `3h working on canvas partnership` → { thread: "canvas-partnership", time_spent: "3h", progress: null }

#### Tags (NEW)

- `#parenting #health` → tags: ["parenting", "health"]

#### People (NEW)

- `@colin @leon @merishe` → people: ["colin", "leon", "merishe"]

#### Frameworks (NEW)

- `[[spin-selling]] [[bill-campbell]]` → frameworks: ["spin-selling", "bill-campbell"]

#### Contexts (NEW)

- `@calls @office` → contexts: ["calls", "office"]

### Error Handling

- **400**: Missing required fields (date or text)
- **500**: Internal server error (logged to console)

### Example Request

```bash
curl -X POST http://localhost:5173/api/extract-entry \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11",
    "text": "Heute ins Bett um 23:00, aufgewacht um 07:30. 8h geschlafen, gute Qualität. High energy. Running gemacht, Sauna. Dankbar für family time - quality moments with kids. Gegessen um 12:00 300g Joghurt mit Beeren. 90 minutes worked on printulu exit deal with @colin. #m&a #sales"
  }'
```

### Example Response

```json
{
  "extracted": {
    "sleep": {
      "bedtime": "23:00",
      "wake_time": "07:30",
      "duration": "8",
      "quality": "good"
    },
    "energy": "high",
    "habits": {
      "running": true,
      "sauna": true
    },
    "gratitude": [
      {
        "thing": "family time",
        "why": "quality moments with kids"
      }
    ],
    "food": [
      {
        "time": "12:00",
        "meal": "Joghurt mit Beeren",
        "portion_grams": [300]
      }
    ],
    "work_log": [
      {
        "thread": "printulu-exit-deal",
        "time_spent": "90min",
        "progress": null
      }
    ],
    "tags": ["m&a", "sales"],
    "people": ["colin"]
  },
  "confidence": 0.85,
  "suggestions": []
}
```

---

## Endpoint 2: `/api/entries/[date]`

**Location**: `src/routes/api/entries/[date]/+server.ts`
**Methods**: POST, GET
**Status**: ✅ Exists and Working

### POST: Save Entry

#### Request Format

```typescript
{
  frontmatter: object; // YAML frontmatter
  body: string; // Markdown content
}
```

#### Response Format

```typescript
{
  success: boolean;
  filePath: string;
  message: string;
}
```

#### Error Handling

- **400**: Invalid date format (not YYYY-MM-DD)
- **400**: Missing required fields (frontmatter or body)
- **500**: Failed to save entry (file system error)

#### Example Request

```bash
curl -X POST http://localhost:5173/api/entries/2026-02-11 \
  -H "Content-Type: application/json" \
  -d '{
    "frontmatter": {
      "date": "2026-02-11",
      "energy": "high",
      "schema_version": 2,
      "habits": {
        "running": "✓",
        "sauna": "✓"
      },
      "sleep": {
        "bedtime": "23:00",
        "wake_time": "07:30",
        "duration": "8h",
        "quality": "good"
      },
      "tags": ["parenting", "health"],
      "people": ["linus", "anton", "cari"]
    },
    "body": "## Morning\n\nStarted day with energy.\n"
  }'
```

#### Example Response

```json
{
  "success": true,
  "filePath": "/Users/amk/Projects/amk-journal/users/amk/entries/2026-02-11.md",
  "message": "Entry saved: 2026-02-11"
}
```

### GET: Read Entry

#### Request Format

```
GET /api/entries/[date]
```

#### Response Format

```typescript
{
  exists: boolean;
  frontmatter: object | null;
  body: string;
}
```

#### Example Request

```bash
curl http://localhost:5173/api/entries/2026-02-11
```

#### Example Response

```json
{
  "exists": true,
  "frontmatter": {
    "date": "2026-02-11",
    "energy": "high",
    "schema_version": 2
  },
  "body": "## Morning\n\nStarted day with energy.\n"
}
```

---

## Dependencies

### Required Package: js-yaml

**Status**: ✅ Installed (v4.1.1)

```bash
npm list js-yaml
# amk-command-center@0.0.1
# └── js-yaml@4.1.1
```

The `js-yaml` package is used in `/api/entries/[date]/+server.ts` for parsing and serializing YAML frontmatter.

---

## Schema Validation

Both endpoints align with the Journal V2 Schema:

- **Location**: `/Users/amk/Projects/amk-journal/.claude/schemas/daily-entry-v2.schema.json`
- **Key Fields**: date, energy, schema_version, tags, people, frameworks, habits, sleep, food

---

## Testing

### Manual Test Script

A comprehensive test script has been created:

**Location**: `/Users/amk/Projects/amk-command-center/test-endpoints.sh`

#### Run Tests

```bash
# Start dev server first
npm run dev

# In another terminal, run tests
chmod +x test-endpoints.sh
./test-endpoints.sh
```

#### Test Cases

1. ✅ Extract entry with German voice input
2. ✅ Extract entry with existing data merge
3. ✅ Save entry to journal file
4. ✅ Read entry from journal file
5. ✅ Error handling: Missing fields
6. ✅ Error handling: Invalid date format

---

## Integration with Journal API

The Command Center endpoints are designed to work alongside the Journal API server:

- **Journal API**: `http://localhost:3001` (Bun server)
- **Command Center**: `http://localhost:5173` (SvelteKit dev server)

### Workflow

```
Voice Input → Command Center (/api/extract-entry)
              ↓
          ExtractedData
              ↓
Command Center (/api/entries/[date]) → Journal File (.md)
              ↓
Journal API (reads .md files) → Tools (M&A Tracker, etc.)
```

---

## Success Criteria

| Criterion                                       | Status | Notes                 |
| ----------------------------------------------- | ------ | --------------------- |
| Both endpoints return 200 with valid JSON       | ✅     | Tested with curl      |
| extract-entry returns ExtractedData type        | ✅     | Updated with work_log |
| entries/[date] writes valid markdown to journal | ✅     | Uses js-yaml          |
| work_log extraction works                       | ✅     | Patterns implemented  |
| Tags, people, frameworks extracted              | ✅     | Regex patterns added  |
| Error handling graceful                         | ✅     | 400/500 responses     |

---

## Next Steps (Optional Enhancements)

### Phase 2: Real AI Extraction

Replace mock extraction with Claude API:

1. Set `ANTHROPIC_API_KEY` in environment
2. Uncomment `extractWithClaude()` function
3. Replace `extractMockData()` call with `extractWithClaude()`

### Phase 3: Advanced Work Log Extraction

- Extract progress mentions: "made progress on X", "completed Y"
- Link to actual thread files in `users/amk/threads/active/`
- Calculate total time spent per day/week

### Phase 4: Thread Linking

- Validate thread exists before adding to work_log
- Auto-suggest similar threads if exact match not found
- Create CRM links when @person mentioned

---

## Files Modified

1. ✅ `src/lib/types.ts` - Added WorkLogEntry interface, updated ExtractedData
2. ✅ `src/routes/api/extract-entry/+server.ts` - Added work_log extraction logic
3. ✅ Created `test-endpoints.sh` - Comprehensive test suite
4. ✅ Created this report - `ENDPOINT-TEST-REPORT.md`

---

## Conclusion

Both required endpoints exist and have been enhanced with work_log extraction. The system is ready for voice journal integration with the following capabilities:

- ✅ Extract sleep, energy, habits, intentions, gratitude, food
- ✅ Extract work_log with thread linking and time tracking (NEW)
- ✅ Extract tags, people, frameworks, contexts (NEW)
- ✅ Save to journal files with proper YAML frontmatter
- ✅ Read existing journal entries
- ✅ Merge with existing data
- ✅ Graceful error handling

The endpoints follow TypeScript strict mode and use proper type definitions from `$lib/types`.
