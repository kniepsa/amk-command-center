# Voice Journal Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Voice Journal Flow                         │
└─────────────────────────────────────────────────────────────────┘

1. CAPTURE (Voice Input)
   │
   ├─> User speaks in German/English
   │   "Heute ins Bett um 23:00. Running gemacht.
   │    90 minutes on printulu with @colin. #m&a"
   │
   └─> Transcription (Whisper API / Browser Speech Recognition)
       │
       ▼

2. EXTRACT (POST /api/extract-entry)
   │
   ├─> Pattern Matching Engine
   │   ├─ Sleep: "ins bett um 23:00" → bedtime: "23:00"
   │   ├─ Habits: "running" → running: true
   │   ├─ Work Log: "90 minutes on printulu" → { thread: "printulu", time_spent: "90min" }
   │   ├─ People: "@colin" → people: ["colin"]
   │   └─ Tags: "#m&a" → tags: ["m&a"]
   │
   └─> Structured Data (JSON)
       {
         "sleep": { "bedtime": "23:00" },
         "habits": { "running": true },
         "work_log": [{ "thread": "printulu", "time_spent": "90min" }],
         "people": ["colin"],
         "tags": ["m&a"]
       }
       │
       ▼

3. SAVE (POST /api/entries/[date])
   │
   ├─> Convert to Markdown + YAML Frontmatter
   │   ---
   │   date: 2026-02-11
   │   energy: high
   │   tags: [m&a]
   │   people: [colin]
   │   ---
   │   ## Work
   │   90 minutes on printulu deal.
   │
   └─> Write to Journal File
       /Users/amk/Projects/amk-journal/users/amk/entries/2026-02-11.md
       │
       ▼

4. INTEGRATE (Journal API + Tools)
   │
   ├─> Journal API (Bun Server, Port 3001)
   │   Reads markdown files
   │   Exposes as JSON API
   │   │
   │   ├─> GET /entries → Recent entries
   │   ├─> GET /people → CRM data
   │   └─> GET /urgent → Reminders, deadlines
   │
   └─> Specialized Tools (SvelteKit Apps)
       ├─ M&A Tracker (tracks deals, buyers, progress)
       ├─ Content Studio (generates articles from learnings)
       └─ Dashboard (aggregates metrics, habits, work log)
```

---

## Component Architecture

### 1. Command Center (SvelteKit App)

**Port**: 5173 (dev), 3000 (prod)
**Stack**: SvelteKit, TypeScript, Tailwind CSS

#### API Endpoints

```
/api/extract-entry       [POST]   Extract structured data from text
/api/entries/[date]      [POST]   Save journal entry
/api/entries/[date]      [GET]    Read journal entry
/api/transcribe          [POST]   Transcribe audio to text
/api/urgent              [GET]    Get urgent items
/api/weekly/current      [GET]    Current week priorities
/api/coaches/config      [GET]    Guru modes config
```

#### Pages

```
/                        Dashboard (habits, metrics, priorities)
/voice                   Voice capture interface
/settings/coaches        Configure guru modes
/demo-voice-with-feedback  Test voice extraction
```

### 2. Journal API (Bun Server)

**Port**: 3001
**Stack**: Bun, TypeScript, YAML parser

#### Responsibilities

- Read journal markdown files
- Parse YAML frontmatter
- Extract metadata (work_log, people, tags)
- Expose as JSON API
- Authentication via Bearer token

#### Endpoints

```
GET  /health             Health check
GET  /entries            Recent entries with metadata
GET  /people             CRM data
GET  /content-ideas      Content generation feed
GET  /urgent             Reminders, deadlines, waiting items
POST /sync               Write back to journal (bi-directional)
POST /transcribe         Whisper API integration
```

### 3. Journal Repository (Markdown Files)

**Location**: `/Users/amk/Projects/amk-journal/`

#### Structure

```
users/amk/
├── areas.md                    # Strategic dashboard
├── next.md                     # GTD Next Actions
├── contexts.md                 # Quick reference (@calls, @office)
├── entries/                    # Daily logs
│   └── YYYY-MM-DD.md
├── people/                     # CRM
│   └── @handle.md
├── threads/active/             # PARA Projects
│   └── project-name.md
├── wisdom/                     # Frameworks, mental models
│   └── framework-name.md
└── learning/                   # Micro-learning curricula
    └── curricula/sales/
```

---

## Data Flow: Voice to Journal

### Step 1: Voice Capture

**Input**: Audio (German/English)
**Output**: Text transcript

```javascript
// Browser Speech Recognition (Chrome)
const recognition = new webkitSpeechRecognition();
recognition.lang = "de-DE";
recognition.continuous = true;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // Send to extraction endpoint
};
```

**Alternative**: Whisper API (more accurate)

```bash
curl -X POST /api/transcribe \
  -F "audio=@recording.wav"
```

### Step 2: Extract Structured Data

**Input**: Text transcript
**Output**: ExtractedData (JSON)

```typescript
const response = await fetch("/api/extract-entry", {
  method: "POST",
  body: JSON.stringify({
    date: "2026-02-11",
    text: "Heute ins Bett um 23:00. Running gemacht. 90 minutes on printulu.",
  }),
});

const { extracted, confidence, suggestions } = await response.json();
```

**Extraction Engine** (Pattern Matching):

```typescript
// Sleep patterns
/ins bett um (\d{1,2}):?(\d{2})?/i
/aufgewacht um (\d{1,2}):?(\d{2})?/i
/(\d+(\.\d+)?)\s*h(our)?s?\s*(geschlafen|sleep)/i

// Work log patterns
/(\d+)\s*(minutes?|mins?|h(?:ours?)?)\s+(?:on|worked on)\s+([a-z0-9-]+)/gi

// Mentions
/@([a-z0-9_-]+)/gi              // People
/#([a-z0-9_-]+)/gi              // Tags
/\[\[([a-z0-9_-]+)\]\]/gi       // Frameworks
```

### Step 3: Save to Journal

**Input**: ExtractedData + body text
**Output**: Markdown file

```typescript
const response = await fetch("/api/entries/2026-02-11", {
  method: "POST",
  body: JSON.stringify({
    frontmatter: {
      date: "2026-02-11",
      energy: "high",
      schema_version: 2,
      tags: ["m&a"],
      people: ["colin"],
      work_log: [
        { thread: "printulu-exit-deal", time_spent: "90min", progress: null },
      ],
    },
    body: "## Morning\n\nGood energy today.\n\n## Work\n\n90 minutes on printulu deal.",
  }),
});
```

**File Written**:

```markdown
---
date: 2026-02-11
energy: high
schema_version: 2
tags:
  - m&a
people:
  - colin
work_log:
  - thread: printulu-exit-deal
    time_spent: 90min
    progress: null
---

## Morning

Good energy today.

## Work

90 minutes on printulu deal with @colin. Used [[spin-selling]] framework.
```

### Step 4: Consume via Journal API

**Input**: Journal markdown files
**Output**: JSON API responses

```bash
# Get recent entries
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:3001/entries?limit=7

# Response:
{
  "entries": [
    {
      "filename": "2026-02-11.md",
      "date": "2026-02-11",
      "frontmatter": {
        "energy": "high",
        "tags": ["m&a"]
      },
      "work_log": [
        {
          "thread": "printulu-exit-deal",
          "time_spent": "90min"
        }
      ],
      "mentions": ["colin"],
      "content_preview": "Good energy today. 90 minutes on printulu deal."
    }
  ]
}
```

---

## Pattern Matching Reference

### Sleep Extraction

| Pattern               | Example Input         | Extracted Field    |
| --------------------- | --------------------- | ------------------ |
| `ins bett um HH:MM`   | "ins bett um 23:00"   | bedtime: "23:00"   |
| `aufgewacht um HH:MM` | "aufgewacht um 07:30" | wake_time: "07:30" |
| `Xh geschlafen`       | "8h geschlafen"       | duration: 8.0      |
| `gute qualität`       | "gute qualität"       | quality: "good"    |

### Habits Extraction

| Pattern             | Example Input                   | Extracted Field            |
| ------------------- | ------------------------------- | -------------------------- |
| `laufen`, `running` | "Running gemacht"               | running: true              |
| `sauna`             | "Sauna gewesen"                 | sauna: true                |
| `elektrolyte`       | "Morgens Elektrolyte getrunken" | morning_electrolytes: true |

### Work Log Extraction

| Pattern           | Example Input            | Extracted Data                              |
| ----------------- | ------------------------ | ------------------------------------------- |
| `X minutes on Y`  | "90 minutes on printulu" | { thread: "printulu", time_spent: "90min" } |
| `worked on Y Xh`  | "worked on leon deal 2h" | { thread: "leon-deal", time_spent: "2h" }   |
| `Xh working on Y` | "3h working on canvas"   | { thread: "canvas", time_spent: "3h" }      |

### Mention Extraction

| Pattern         | Example Input           | Extracted Field              |
| --------------- | ----------------------- | ---------------------------- |
| `@handle`       | "meeting with @colin"   | people: ["colin"]            |
| `#tag`          | "discussed #m&a"        | tags: ["m&a"]                |
| `[[framework]]` | "used [[spin-selling]]" | frameworks: ["spin-selling"] |

---

## Thread Linking

### Thread Name Normalization

```typescript
// Input: "90 minutes on Printulu Exit Deal"
// Output: { thread: "printulu-exit-deal", time_spent: "90min" }

function normalizeThreadName(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
```

### Thread File Lookup

```
Work log entry:
  thread: "printulu-exit-deal"

Possible thread files:
  /users/amk/threads/active/printulu-exit-all-buyers.md
  /users/amk/threads/active/printulu-exit-bidvest-data-colin.md
  /users/amk/threads/active/printulu-exit-leon-hybrid-structure-proposal.md

Match strategy:
  1. Exact match on filename
  2. Fuzzy match (Levenshtein distance < 3)
  3. Substring match
  4. Suggest creation if no match
```

---

## Type Definitions

### ExtractedData Interface

```typescript
interface ExtractedData {
  sleep?: {
    bedtime?: string;
    wake_time?: string;
    duration?: number;
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
  };
  intentions?: string[];
  gratitude?: Array<{ thing: string; why: string }>;
  food?: Array<{
    time: string;
    meal: string;
    portion_grams?: number[];
    usda_ids?: string[];
  }>;
  work_log?: Array<{
    thread: string;
    time_spent: string | null;
    progress: string | null;
  }>;
  tags?: string[];
  people?: string[];
  frameworks?: string[];
  contexts?: Array<
    "calls" | "online" | "office" | "home" | "anywhere" | "waiting"
  >;
}
```

### Journal Entry File Format

```yaml
---
date: 2026-02-11
energy: high
schema_version: 2
tags:
  - m&a
  - sales
people:
  - colin
  - leon
frameworks:
  - spin-selling
  - bill-campbell
contexts:
  - calls
work_log:
  - thread: printulu-exit-deal
    time_spent: 90min
    progress: Qualified 3 buyers
  - thread: canvas-partnership
    time_spent: 45min
    progress: null
habits:
  running: ✓
  sauna: ✓
  journaling: ✓
sleep:
  bedtime: "23:00"
  wake_time: "07:30"
  duration: 8h
  quality: good
gratitude:
  - thing: family time
    why: quality moments with kids
food:
  - time: "12:00"
    meal: Joghurt mit Beeren
    portion_grams: [300]
---

## Morning

Good energy today. Started with running and sauna.

## Work

90 minutes on printulu exit deal with @colin. Qualified 3 potential buyers.

Used [[spin-selling]] framework for discovery calls.

## Afternoon

Family time with @linus, @anton, and @cari.
```

---

## Error Handling

### Extract Entry Errors

```typescript
// 400 Bad Request - Missing fields
{
  "error": "Missing required fields: date and text"
}

// 500 Internal Server Error
{
  "error": "Internal server error"
}
```

### Save Entry Errors

```typescript
// 400 Bad Request - Invalid date
{
  "error": "Invalid date format. Expected YYYY-MM-DD"
}

// 400 Bad Request - Missing frontmatter
{
  "error": "Missing required fields: frontmatter, body"
}

// 500 Internal Server Error - File system
{
  "error": "Failed to save entry",
  "details": "EACCES: permission denied"
}
```

---

## Testing

### Manual Test Commands

```bash
# Extract entry
curl -X POST http://localhost:5173/api/extract-entry \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-02-11","text":"ins bett um 23:00. running gemacht. 90 minutes on printulu with @colin. #m&a"}'

# Save entry
curl -X POST http://localhost:5173/api/entries/2026-02-11 \
  -H "Content-Type: application/json" \
  -d '{"frontmatter":{"date":"2026-02-11","energy":"high"},"body":"Good day."}'

# Read entry
curl http://localhost:5173/api/entries/2026-02-11
```

### Automated Test Suite

```bash
chmod +x test-endpoints.sh
./test-endpoints.sh
```

---

## Performance Considerations

### Pattern Matching

- Regex compilation cached per request
- Early exit on no match
- Deduplication via Set for tags/people/frameworks

### File I/O

- Synchronous writes (ensures data integrity)
- Directory check cached (createSync only if missing)
- YAML parsing via js-yaml (battle-tested)

### API Response Times

- Extract entry: ~50-100ms (pattern matching)
- Save entry: ~20-50ms (file write)
- Read entry: ~10-30ms (file read + parse)

---

## Security

### API Authentication

- Extract entry: No auth (frontend-only)
- Save entry: No auth (local file system)
- Journal API: Bearer token required (JOURNAL_API_KEY)

### Input Validation

- Date format: `/^\d{4}-\d{2}-\d{2}$/`
- Thread names: `/^[a-z0-9-]+$/`
- People/tags: `/^[a-z0-9_-]+$/`
- Frameworks: `/^[a-z0-9_-]+$/`

### File System

- Writes restricted to `/Users/amk/Projects/amk-journal/users/amk/entries/`
- No path traversal (date format validated)
- UTF-8 encoding enforced

---

## Future Enhancements

### Phase 2: AI Extraction

- Replace pattern matching with Claude API
- Confidence scoring per field
- Contextual understanding (not just regex)

### Phase 3: Thread Validation

- Check thread file exists before adding to work_log
- Auto-suggest similar threads
- Create thread if mentioned but doesn't exist

### Phase 4: Advanced Analytics

- Weekly work_log summaries
- Time spent per thread/person/tag
- Energy vs productivity correlations
- Habit streak tracking

---

## Related Documentation

- **ENDPOINT-TEST-REPORT.md** - Full API documentation
- **API-QUICK-REFERENCE.md** - One-page quick reference
- **VERIFICATION-SUMMARY.md** - Implementation summary
- **test-endpoints.sh** - Test suite
