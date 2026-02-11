# Command Center V2 - Backend Architecture

**Visual guide for Agent 1 (Frontend Developer)**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (Agent 1)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Chat Input  │  │   Sidebar    │  │   Weekly     │      │
│  │  Component   │  │   Preview    │  │   Widget     │      │
│  └──────┬───────┘  └──────▲───────┘  └──────▲───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │ POST text        │ Show extracted   │ GET priorities
          │                  │ data             │
          ▼                  │                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Routes (Agent 2)                       │
│  ┌──────────────────────────┐  ┌────────────────────────┐  │
│  │  /api/extract-entry      │  │  /api/weekly/current   │  │
│  │  (POST)                  │  │  (GET)                 │  │
│  │  ┌──────────────────┐    │  │  ┌──────────────────┐ │  │
│  │  │ Pattern Matching │    │  │  │ Read Weekly Plan │ │  │
│  │  │ (German/English) │    │  │  │ Parse Frontmatter│ │  │
│  │  │ Sleep, Energy,   │    │  │  │ Calculate %      │ │  │
│  │  │ Habits, Food...  │    │  │  └──────────────────┘ │  │
│  │  └──────────────────┘    │  │                        │  │
│  └────────────┬─────────────┘  └────────────┬───────────┘  │
│               │                              │              │
└───────────────┼──────────────────────────────┼──────────────┘
                │                              │
                ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│              File System Utilities                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  file-utils.ts                                       │   │
│  │  • parseMarkdown() → Split YAML + content           │   │
│  │  • parseYAML() → Parse frontmatter                  │   │
│  │  • readDailyEntry() → Load entry data               │   │
│  │  • writeDailyEntry() → Save entry (Phase 2)         │   │
│  │  • readWeeklyPlan() → Load weekly priorities        │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           AMK Journal Repository (File System)              │
│  /Users/amk/Projects/amk-journal/                           │
│  ├── users/amk/entries/                                     │
│  │   ├── 2026-02-11.md  ← Daily entry files                │
│  │   ├── 2026-02-10.md                                      │
│  │   └── ...                                                │
│  └── users/amk/weekly-plans/                                │
│      ├── 2026-W06.md  ← Weekly plan files                   │
│      ├── 2026-W05.md                                        │
│      └── ...                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Extract Entry

**User types**: "Ins Bett um 22:00, 8h geschlafen, gute Qualität"

```
┌──────────┐
│  User    │  Types voice transcript
│  Input   │
└────┬─────┘
     │
     │ 1. User types/pastes text
     ▼
┌────────────────────┐
│  Chat Component    │  Debounce 500ms
│  (Agent 1)         │
└────┬───────────────┘
     │
     │ 2. POST /api/extract-entry
     │    { date: "2026-02-11", text: "..." }
     ▼
┌─────────────────────────┐
│  Extract Entry API      │  Pattern matching:
│  (Agent 2)              │  • "ins Bett um 22:00" → bedtime
│                         │  • "8h geschlafen" → duration
│  Mock Implementation:   │  • "gute Qualität" → quality
│  - Regex patterns       │
│  - German/English       │  Phase 2: Claude API
│  - Returns confidence   │
└────┬────────────────────┘
     │
     │ 3. Response:
     │    {
     │      extracted: {
     │        sleep: { bedtime: "22:00", duration: "8.0", quality: "good" }
     │      },
     │      confidence: 0.85,
     │      suggestions: []
     │    }
     ▼
┌────────────────────┐
│  Sidebar Preview   │  Show extracted data
│  (Agent 1)         │  Confidence warning if < 0.7
└────────────────────┘
```

---

## Data Flow: Weekly Priorities

**User opens "Today" tab**

```
┌──────────┐
│  User    │  Opens Today tab
└────┬─────┘
     │
     │ 1. Page load
     ▼
┌────────────────────┐
│  Weekly Widget     │  Fetch current week
│  (Agent 1)         │
└────┬───────────────┘
     │
     │ 2. GET /api/weekly/current
     ▼
┌─────────────────────────┐
│  Weekly Current API     │  1. Calculate week: "2026-W06"
│  (Agent 2)              │  2. Read file: weekly-plans/2026-W06.md
│                         │  3. Parse YAML frontmatter
│  Implementation:        │  4. Extract priorities[]
│  - getCurrentWeek()     │  5. Calculate progress %
│  - readWeeklyPlan()     │
│  - parseMarkdown()      │  Fallback: Mock priorities if file missing
└────┬────────────────────┘
     │
     │ 3. Response:
     │    {
     │      week: "2026-W06",
     │      priorities: [
     │        { id: "w06-p1", text: "Close Printulu deal",
     │          days_active: 2, total_days: 7, progress_percent: 29 }
     │      ]
     │    }
     ▼
┌────────────────────┐
│  Weekly Widget     │  Display:
│  (Agent 1)         │  • Priority text
│                    │  • Progress bars (29%)
│                    │  • "Use as Intentions" button
└────────────────────┘
```

---

## File Format: Daily Entry

```markdown
---
date: 2026-02-11
energy: high
sleep:
  bedtime: "22:00"
  wake_time: "06:00"
  duration: "8.0"
  quality: good
habits:
  running: true
  journaling: true
  sales_learning: true
intentions:
  - text: "Close Leon deal"
    weekly_priority_id: w06-p1
  - text: "Sales learning Day 8"
gratitude:
  - thing: "Jani"
    why: "Sie hat mir Zeit gegeben"
food:
  - time: "12:00"
    meal: "Joghurt mit Beeren"
    portion_grams: [300]
---

# 2026-02-11

## Morning

Heute früh aufgestanden, gut geschlafen...

## Evening

[Content continues...]
```

**Parsing**:

1. `parseMarkdown()` splits at `---` delimiters
2. `parseYAML()` converts frontmatter to object
3. `readDailyEntry()` returns typed `HabitData` object

---

## File Format: Weekly Plan

```markdown
---
week: 2026-W06
year: 2026
start_date: 2026-02-10
end_date: 2026-02-16
priorities:
  - id: w06-p1
    text: "Close Printulu deal (Leon/Jerome/Abdul)"
    days_active: [Mon, Tue]
    status: in_progress
  - id: w06-p2
    text: "Sales learning Day 8-14"
    days_active: [Mon, Tue]
    status: in_progress
---

# Week 06, 2026

[Markdown content continues...]
```

**Parsing**:

1. `readWeeklyPlan()` reads file
2. `parseMarkdown()` extracts frontmatter
3. `extractPriorities()` maps to `WeeklyPriority[]`
4. Calculate `progress_percent = (days_active.length / 7) * 100`

---

## TypeScript Type Flow

```typescript
// User input → API request
interface ExtractEntryRequest {
  date: string;              // "2026-02-11"
  text: string;              // Voice transcript
  existing?: Partial<HabitData>; // Optional merge
}

// API response → Frontend display
interface ExtractEntryResponse {
  extracted: {
    sleep?: { bedtime, wake_time, duration, quality };
    energy?: 'high' | 'medium' | 'low' | 'drained';
    habits?: { running, sauna, ... };
    intentions?: string[];
    gratitude?: Array<{ thing, why }>;
    food?: Array<{ time, meal, portion_grams? }>;
  };
  confidence: number;        // 0.0 to 1.0
  suggestions?: string[];    // Helpful tips
}

// Weekly priorities
interface CurrentWeekResponse {
  week: string;              // "2026-W06"
  priorities: WeeklyPriority[];
}

interface WeeklyPriority {
  id: string;                // "w06-p1"
  text: string;              // "Close Printulu deal"
  days_active: number;       // 2
  total_days: number;        // 7
  progress_percent: number;  // 29
  status?: 'in_progress' | 'completed' | 'blocked' | 'dropped';
}
```

**Import in Frontend**:

```typescript
import type {
  ExtractEntryResponse,
  CurrentWeekResponse,
  WeeklyPriority,
} from "$lib/types";
```

---

## Error Handling

### Extract Entry Errors

```typescript
try {
  const response = await fetch("/api/extract-entry", {
    method: "POST",
    body: JSON.stringify({ date, text }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      // Missing date/text
      alert("Please provide date and text");
    } else if (response.status === 500) {
      // Server error
      alert("Extraction failed, try again");
    }
    return;
  }

  const { extracted, confidence } = await response.json();

  // Warn on low confidence
  if (confidence < 0.7) {
    showWarning("Low confidence extraction, please review");
  }
} catch (error) {
  // Network error
  alert("Cannot reach server, check connection");
}
```

### Weekly Current Errors

```typescript
try {
  const response = await fetch("/api/weekly/current");

  if (!response.ok) {
    // Server error
    console.error("Failed to load weekly priorities");
    // Show empty state or cached data
    return;
  }

  const { week, priorities } = await response.json();

  if (priorities.length === 0) {
    // No weekly plan exists
    showMessage("No weekly plan found, create one?");
  }
} catch (error) {
  // Network error
  console.error("Cannot reach server");
}
```

---

## Performance Characteristics

### Phase 1 (Current)

| Operation      | Time  | Notes                    |
| -------------- | ----- | ------------------------ |
| Extract entry  | ~10ms | Regex patterns (instant) |
| Weekly current | ~50ms | Single file read + parse |
| File parse     | ~5ms  | Simple YAML parser       |

### Phase 2 (Target)

| Operation           | Time   | Notes                  |
| ------------------- | ------ | ---------------------- |
| Extract entry       | <2s    | Claude API latency     |
| Weekly current      | <500ms | 7 file reads + caching |
| Daily progress scan | <1s    | Cached (5-min TTL)     |

---

## Testing Strategy

### 1. Automated Tests (Backend)

```bash
./tests/api-test.sh
```

Tests:

- German voice transcript
- English voice transcript
- Minimal input
- Error cases (missing data)
- Weekly priorities

### 2. Manual Testing (Frontend)

```typescript
// In TodayTab.svelte
async function testExtraction() {
  const testCases = [
    "Ins Bett um 22:00, 8h geschlafen, gute Qualität",
    "High energy heute, dankbar für Jani",
    "Gegessen um 12:00 300g Joghurt mit Beeren",
  ];

  for (const text of testCases) {
    const result = await extractFromText(text);
    console.log("Extracted:", result);
  }
}
```

### 3. E2E Testing (Phase 2)

- User types voice transcript
- Debounce works (500ms delay)
- Extraction shows loading state
- Extracted data appears in sidebar
- Confidence warnings show
- Save button writes to file system

---

## Next Steps for Agent 1

### Immediate (Week 1)

1. **Create Chat Component**
   - Text input (multiline)
   - "Extract" button
   - Debounce input (500ms)
   - Loading spinner

2. **Create Sidebar Preview**
   - Display extracted data
   - Color-code by confidence
   - Show suggestions below
   - "Save to Journal" button

3. **Create Weekly Widget**
   - Fetch on page load
   - Display priorities with progress bars
   - "Use as Intentions" button
   - Refresh on save

### Polish (Week 2)

4. **Error Handling**
   - Show toast on API errors
   - Retry button
   - Offline detection

5. **UX Enhancements**
   - Real-time extraction preview (debounced)
   - Confidence color coding (green/yellow/red)
   - Keyboard shortcuts (Cmd+Enter to save)
   - Auto-save draft to localStorage

---

## Questions?

- Check `API-CONTRACTS.md` for detailed API specs
- Check `BACKEND-README.md` for troubleshooting
- Run `./tests/api-test.sh` to verify backend
- Test with curl to isolate issues

---

**Backend Specialist Agent 2**
