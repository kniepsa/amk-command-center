# Command Center Timeline Architecture
**Date**: 2026-02-16
**Status**: Strategic Planning

---

## First Principles Analysis

### What You Actually Want

1. **Historic Log**: See everything that happened (past journal entries, completed tasks, CRM interactions)
2. **Planned Items**: See what's coming (upcoming tasks, calendar events, goals)
3. **Calendar Integration**: Google Calendar events visible in timeline
4. **Search**: Find anything across time ("Show me all interactions with Leon")

### Current State (❌ Gaps)

- **Command Center**: Only shows TODAY (present moment)
- **M&A Tracker**: Only shows active buyers (no history)
- **Journal**: Entries stored but no timeline view
- **Calendar**: External (Google Calendar), not integrated
- **Search**: Doesn't exist

---

## Pattern from Printulu Growth Engine

Growth Engine uses **activity logging pattern**:

```javascript
// Every action logged with timestamp
await log({
  action: "search",
  customer: customer.name,
  message: "Found profile: https://...",
  profileUrl,
  timestamp: new Date().toISOString()
});

// Stored in: logs/batch-feb10-log.json
```

**Key Insights**:
- ✅ Every action timestamped
- ✅ Structured log entries (action, entity, message)
- ✅ File-based persistence (simple, no DB needed)
- ✅ Searchable JSON

---

## Proposed Architecture: Timeline as Source of Truth

### Core Concept

**All activities flow into unified timeline**:

```
PAST ←────── TODAY ────── → FUTURE

Journal Entry     Current Focus      Planned Task
Task Completed    Active Task        Calendar Event
CRM Call          Urgent Items       Weekly Goals
Sales Lesson      Daily AI           Future Reminder
```

### Data Model

```typescript
interface TimelineEntry {
  id: string;                    // UUID
  timestamp: string;              // ISO 8601
  type: "journal" | "task" | "crm" | "learning" | "calendar" | "habit";
  status: "planned" | "active" | "completed" | "missed";

  // Entity reference
  entity: {
    id: string;                   // e.g., "buyer_leon", "task_123"
    name: string;                 // "Leon Welcher", "Call Peter"
    workspace: "amk" | "ma";
  };

  // Content
  title: string;                  // "Morning Ritual completed"
  description?: string;           // Full text
  metadata?: Record<string, any>; // Flexible data

  // Time context
  scheduledFor?: string;          // Future events
  completedAt?: string;           // Past events
  duration?: number;              // Milliseconds

  // Relationships
  relatedEntries?: string[];      // Link to other timeline entries
  tags?: string[];                // ["@leon", "#m-a", "[[spin-selling]]"]
}
```

### Storage Strategy

**Option 1: Append-Only Log** (like Growth Engine)
- ✅ Simple: `timeline.jsonl` (newline-delimited JSON)
- ✅ Fast writes (append only)
- ✅ Easy backup/sync
- ❌ Slow search (must scan entire file)
- ❌ No indexing

**Option 2: SQLite Timeline Table** (recommended)
- ✅ Fast search with indexes
- ✅ Complex queries ("show all Leon interactions")
- ✅ Already using SQLite for backend
- ✅ Time-based pagination
- ❌ More complex setup

**Recommendation**: **SQLite** with these indexes:

```sql
CREATE TABLE timeline (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  workspace TEXT,
  title TEXT NOT NULL,
  description TEXT,
  metadata TEXT,  -- JSON blob
  scheduled_for TEXT,
  completed_at TEXT,
  duration INTEGER,
  tags TEXT,  -- JSON array
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeline_timestamp ON timeline(timestamp DESC);
CREATE INDEX idx_timeline_entity ON timeline(entity_id);
CREATE INDEX idx_timeline_workspace ON timeline(workspace);
CREATE INDEX idx_timeline_status ON timeline(status);
CREATE INDEX idx_timeline_scheduled ON timeline(scheduled_for) WHERE scheduled_for IS NOT NULL;
```

---

## UI Design: 3-Tab Timeline

### Tab 1: Past (History)

**View**: Infinite scroll timeline, most recent first

```
┌─────────────────────────────────────┐
│ 🔍 Search: "leon" | "last week"     │
├─────────────────────────────────────┤
│                                     │
│ TODAY - FEB 16, 2026                │
│ ✅ Morning Ritual completed (7:43am)│
│ 📞 Call with @leon (2:15pm, 15min)  │
│ ✍️ Journal entry saved              │
│                                     │
│ YESTERDAY - FEB 15                  │
│ ✅ Sales Lesson Day 5 completed     │
│ 📋 Task: Review M&A deck - Done     │
│                                     │
│ THIS WEEK - FEB 10-14               │
│ 🔥 5-day Morning Ritual streak      │
│ 💼 3 buyer interactions              │
│                                     │
│ [Load More...]                      │
└─────────────────────────────────────┘
```

**Features**:
- Group by day/week/month
- Filter by type (tasks, calls, habits)
- Search full-text + entity names
- Click → expand full details

### Tab 2: Today (Current)

**Keep existing TodayTab layout** - no changes needed

### Tab 3: Future (Planned)

**View**: Calendar + upcoming tasks

```
┌─────────────────────────────────────┐
│ THIS WEEK                           │
│ ─────────────────────────────────── │
│ Wed Feb 19, 10am                    │
│ 📅 EO Forum Meeting                 │
│                                     │
│ Fri Feb 21                          │
│ 📋 Review Printulu exit proposals   │
│                                     │
│ NEXT WEEK                           │
│ ─────────────────────────────────── │
│ Mon Feb 24, 3pm                     │
│ 📞 Call with @peter (Lawprint)      │
│                                     │
│ MONTHLY GOALS                       │
│ ─────────────────────────────────── │
│ ⏱️ Complete Sales Course (Day 5/30) │
│ 📊 Printulu Exit by March 31        │
└─────────────────────────────────────┘
```

**Features**:
- Google Calendar sync (read-only initially)
- Upcoming tasks from `next.md`
- Weekly/monthly goals
- Countdown timers ("23 days until exit deadline")

---

## Search Implementation

### Backend API

```
GET /api/v1/timeline/search?q=leon&workspace=amk

Response:
{
  "results": [
    {
      "id": "entry_20260214_leon_call",
      "timestamp": "2026-02-14T14:15:00Z",
      "type": "crm",
      "title": "Call with @leon",
      "description": "Discussed R25M hybrid structure...",
      "snippet": "...R25M hybrid structure - R15M Printulu sale + R10M TechTulu...",
      "tags": ["@leon", "#m-a"]
    },
    ...
  ],
  "total": 18
}
```

### Search Scope

1. **Entity search**: "@leon" → all interactions with Leon
2. **Tag search**: "#m-a" → all M&A-related items
3. **Framework search**: "[[spin-selling]]" → all SPIN references
4. **Full-text**: "R25M" → all mentions of this deal
5. **Date range**: "last week", "February", "2026-02-10 to 2026-02-15"

### Search UI

```
┌─────────────────────────────────────┐
│ 🔍 leon                             │
├─────────────────────────────────────┤
│ 18 results for "@leon"              │
│                                     │
│ 📞 Feb 14, 2:15pm - Call            │
│ ...Discussed R25M hybrid structure  │
│                                     │
│ ✍️ Feb 10, 9:00am - Journal Entry   │
│ ...Leon went from "for you anytime" │
│                                     │
│ 📋 Feb 9 - Task Completed           │
│ ...Prepare Leon meeting deck        │
│                                     │
│ [Show all 18 results]               │
└─────────────────────────────────────┘
```

---

## Calendar Integration

### Phase 1: Read-Only Sync (MVP)

Use existing Google Calendar MCP:

```typescript
// Backend cron job (every 15 minutes)
const events = await googleCalendar.listEvents({
  calendarId: 'primary',
  timeMin: new Date().toISOString(),
  timeMax: add(new Date(), { days: 30 }).toISOString(),
  maxResults: 100,
  singleEvents: true,
  orderBy: 'startTime'
});

// Insert into timeline table
for (const event of events) {
  await db.timeline.upsert({
    id: `calendar_${event.id}`,
    timestamp: event.start.dateTime,
    type: 'calendar',
    status: 'planned',
    entity_id: event.id,
    entity_name: event.summary,
    title: event.summary,
    description: event.description,
    scheduled_for: event.start.dateTime,
    duration: differenceInMilliseconds(
      new Date(event.end.dateTime),
      new Date(event.start.dateTime)
    ),
    metadata: JSON.stringify({
      location: event.location,
      attendees: event.attendees,
      hangoutLink: event.hangoutLink
    })
  });
}
```

### Phase 2: Two-Way Sync (Future)

- Create calendar events from Command Center tasks
- Update event status when completed
- Sync reminders

---

## Implementation Plan

### Week 1: Backend Timeline API

**Day 1-2**: Database schema + migrations
```bash
.claude/api/db/migrations/0009_create_timeline.sql
.claude/api/services/timeline-service.ts
.claude/api/routes/v1/timeline.ts
```

**Day 3-4**: Populate timeline from existing data
```typescript
// Migrate existing entries to timeline
await migrateJournalEntries();    // users/amk/entries/*.md
await migrateTaskCompletions();   // next.md history
await migrateCRMInteractions();   // people/*.md
await migrateHabitStreaks();      // habits tracking
```

**Day 5**: Calendar sync cron job
```bash
.claude/api/jobs/sync-calendar.ts
# Run every 15 minutes via node-cron
```

### Week 2: Frontend Timeline UI

**Day 1-2**: Past Tab
```bash
src/routes/past/+page.svelte
src/lib/components/TimelineEntry.svelte
src/lib/components/TimelineSearch.svelte
```

**Day 3-4**: Future Tab
```bash
src/routes/future/+page.svelte
src/lib/components/CalendarView.svelte
src/lib/components/UpcomingTasks.svelte
```

**Day 5**: Search integration
```bash
src/lib/services/timeline-search.ts
src/lib/components/GlobalSearch.svelte  # Header search bar
```

### Week 3: Polish + Voice Integration

**Day 1-2**: Voice commands for timeline
```
"Show me all interactions with Leon"
→ Search timeline for "@leon"

"What's on my calendar tomorrow?"
→ Show future tab filtered to tomorrow

"What did I do last week?"
→ Show past tab filtered to last 7 days
```

**Day 3-5**: Testing + refinement
- Performance testing (10K+ timeline entries)
- Search relevance tuning
- Mobile responsive timeline
- Error handling for calendar sync failures

---

## Technical Decisions

### Why SQLite over append-only log?

| Factor | SQLite | Append-Only Log |
|--------|--------|-----------------|
| **Search speed** | Fast (indexed) | Slow (linear scan) |
| **Filtering** | SQL WHERE clauses | Manual iteration |
| **Pagination** | Built-in LIMIT/OFFSET | Manual slicing |
| **Updates** | Easy (UPDATE) | Append correction entries |
| **Complexity** | Medium | Low |
| **Backup** | Single file | Single file |

**Verdict**: SQLite wins for search performance. Timeline will have 1000s of entries.

### Why separate timeline table instead of query existing tables?

**Option A**: Query across `entries`, `tasks`, `buyers`, `habits` tables
❌ Complex joins
❌ Slow (must query 4+ tables)
❌ Inconsistent schemas

**Option B**: Unified `timeline` table (event sourcing pattern)
✅ Single query for all types
✅ Fast with indexes
✅ Easy to add new event types
✅ Natural fit for time-based views

**Verdict**: Unified timeline table. This is event sourcing architecture.

---

## Voice-First Enhancement

Your feedback: "VOICE FIRST VLL MEHR WIE IM M&A HUB"

### Problem

Current voice extraction quality inconsistent compared to M&A Hub.

### Root Cause Analysis

1. **M&A Hub**: Uses structured prompts focused on specific entities (buyers, deals)
2. **Command Center**: Generic journal extraction (less focused)
3. **Quality**: Specific prompts > Generic prompts

### Solution: Context-Aware Voice Processing

```typescript
// Detect context from current view
if (currentTab === 'crm') {
  // CRM-focused extraction
  prompt = `Extract CRM information:
    - Person name (e.g., "@leon")
    - Company
    - Interaction type (call, email, meeting)
    - Key points discussed
    - Next steps
    - Sentiment (positive/neutral/negative)
  `;
} else if (currentTab === 'tasks') {
  // Task-focused extraction
  prompt = `Extract task information:
    - Task description
    - Priority (high/medium/low)
    - Context (@office, @calls, @online)
    - Due date if mentioned
    - Area (business, family, health, etc.)
  `;
} else {
  // Default journal extraction
  prompt = defaultJournalPrompt;
}
```

**Improvement**: Context-aware prompts should improve extraction 30-50%.

---

## Next Steps

1. ✅ **This document** - Strategic architecture defined
2. ⏱️ **User approval** - Does this match your vision?
3. 🏗️ **Week 1** - Build backend timeline API + calendar sync
4. 🎨 **Week 2** - Build frontend timeline UI (Past/Future tabs)
5. 🎤 **Week 3** - Enhance voice extraction with context-aware prompts
6. 🔍 **Week 4** - Full-text search + testing

**Timeline**: 4 weeks to complete historic log + calendar + search vision.

---

**Questions for User**:
1. Does this match your "historic log + planned + calendar + search" vision?
2. Priority order: Timeline backend first OR voice enhancement first?
3. Should calendar sync start with Google Calendar or include other calendars (Outlook)?

