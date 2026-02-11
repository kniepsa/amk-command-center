# PRD: Weekly → Daily Priority Sync

**Status**: Planning
**Priority**: P1 (High - Core Workflow)
**Owner**: AMK
**Created**: 2026-02-11

---

## Problem Statement

Weekly planning (Warren Buffett 25/5) creates 5-7 priorities, but they **don't flow into daily intentions**. Users must manually:

- Remember weekly priorities when setting daily intentions
- Check weekly plan separately to stay aligned
- Re-type priorities into daily entries

**Current**: Weekly and Daily are siloed tabs
**Desired**: Weekly priorities → Daily intentions (one-click), Daily reflections → Weekly progress

---

## Goals

1. **Primary**: Auto-suggest daily intentions from weekly priorities
2. **Secondary**: Show weekly progress on daily view
3. **Tertiary**: Update weekly plan when daily tasks complete

---

## User Journeys

### Journey 1: Morning Planning from Weekly

1. Open "Today" tab
2. See "This Week's Priorities (3/7)" widget at top
3. Click "Use as Today's Intentions" → Auto-fills intention fields
4. Adjust as needed (move priorities around)
5. Save entry

### Journey 2: Weekly Progress Tracking

1. Open "Weekly" tab
2. See each priority with progress bar
3. Click "Mark Day 2/5 Complete" on priority #1
4. Progress updates automatically from daily entries

### Journey 3: End-of-Week Reflection

1. Friday evening: Open "Weekly" tab
2. See "3/7 priorities completed" summary
3. Click "Review This Week" → Shows all daily entries where priorities mentioned
4. Click "Plan Next Week" → Rolls incomplete priorities forward (optional)

---

## UI Layout

### Today Tab (with Weekly Context)

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Tuesday, Feb 11 2026          Week 06 Progress: 3/7 ✅  │
├─────────────────────────────────────────────────────────────┤
│  🎯 This Week's Top Priorities:                             │
│  1. Close Printulu deal (Leon/Jerome/Abdul)      [Day 2/7]  │
│  2. Sales learning Day 8-14 (SPIN framework)     [Day 2/7]  │
│  3. Plan Germany real estate pitch (Hulisani)    [Day 0/7]  │
│                                                              │
│  [✨ Use These as Today's Intentions]                       │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Today's Intentions:                                         │
│  1. [Leon follow-up: R25M hybrid structure]                 │
│  2. [Sales Day 8: Discovery call framework]                 │
│  3. [Review Germany property options]                       │
│                                                              │
│  [💾 Save Entry]                                            │
└─────────────────────────────────────────────────────────────┘
```

### Weekly Tab (with Daily Progress)

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Week 06 (Feb 10-16)                   Progress: 3/7 ✅  │
├─────────────────────────────────────────────────────────────┤
│  Priority #1: Close Printulu deal                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Mon: ✅ Jerome call scheduled                              │
│  Tue: ✅ Leon meeting (hybrid proposal)                     │
│  Wed: [ ] Abdul follow-up                                   │
│  Thu: [ ] ...                                               │
│  Progress: 2/7 days active                                  │
│                                                              │
│  Priority #2: Sales learning Day 8-14                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Mon: ✅ Day 8 complete (Discovery framework)               │
│  Tue: ✅ Day 9 complete (BANT)                              │
│  Wed: [ ] Day 10 (Objections)                               │
│  Progress: 2/7 days                                         │
│  ─────────────────────────────────────────────────────────  │
│  [📊 View All Progress]  [➡️ Plan Next Week]               │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Phase 1: Read-Only Sync (Week 1)

- [ ] Show weekly priorities on Today tab (read from `/weekly-plans/YYYY-WXX.md`)
- [ ] "Use as Intentions" button pre-fills intention fields
- [ ] Weekly tab shows which days each priority was mentioned

### Phase 2: Write-Back Sync (Week 2)

- [ ] When daily entry saved with intention, update weekly progress
- [ ] Parse daily entries for `[OPEN]` tasks related to weekly priorities
- [ ] Show completion percentage on weekly tab

### Phase 3: Intelligence (Week 3)

- [ ] AI detects when daily intention ≠ weekly priority (suggests realignment)
- [ ] End-of-week rollover: "Priority #3 incomplete, move to next week?"
- [ ] Weekly reflection summary: "You worked on priorities 1,2,5 but not 3,4,6,7"

---

## Data Model

### Weekly Plan File (`users/amk/weekly-plans/2026-W06.md`)

```yaml
---
week: 2026-W06
start_date: 2026-02-10
end_date: 2026-02-16
priorities:
  - id: w06-p1
    text: "Close Printulu deal (Leon/Jerome/Abdul)"
    days_active: [Mon, Tue]
    status: in_progress
    linked_tasks:
      - "users/amk/entries/2026-02-10.md#jerome-call"
      - "users/amk/entries/2026-02-11.md#leon-meeting"
  - id: w06-p2
    text: "Sales learning Day 8-14"
    days_active: [Mon, Tue]
    status: in_progress
parking: [...]
dropped: [...]
---
# Week 06 Brain Dump
[... markdown content ...]
```

### Daily Entry Link

```yaml
---
date: 2026-02-11
intentions:
  - text: "Leon follow-up: R25M hybrid structure"
    weekly_priority_id: w06-p1 # <- Links back to weekly
  - text: "Sales Day 8: Discovery call framework"
    weekly_priority_id: w06-p2
---
```

---

## API Spec

### GET `/api/weekly/current`

**Response:**

```json
{
  "week": "2026-W06",
  "priorities": [
    {
      "id": "w06-p1",
      "text": "Close Printulu deal",
      "days_active": 2,
      "total_days": 7,
      "progress_percent": 28.6,
      "status": "in_progress"
    }
  ]
}
```

### POST `/api/daily/link-weekly`

**Request:**

```json
{
  "date": "2026-02-11",
  "intention": "Leon follow-up",
  "weekly_priority_id": "w06-p1"
}
```

**Response:**

```json
{
  "success": true,
  "updated_progress": 3
}
```

---

## Success Metrics

- **Primary**: 80% of daily intentions linked to weekly priorities within 2 weeks
- **Secondary**: <5 clicks from "see weekly priorities" → "add to today"
- **Tertiary**: Users report feeling more aligned (qualitative survey)

---

## Dependencies

- File system read/write (`weekly-plans/`, `entries/`)
- YAML frontmatter parser with cross-references
- Date/week calculation utilities

---

## Risks & Mitigations

| Risk                                                | Mitigation                                                   |
| --------------------------------------------------- | ------------------------------------------------------------ |
| Users change weekly plan mid-week (orphaned links)  | Show "orphaned" intentions with option to re-link or archive |
| Too many priorities (>7) makes daily view cluttered | Only show top 3-5 most relevant (AI prioritization)          |
| Weekly file format changes break sync               | Version weekly plan schema, migrate old files                |

---

## Open Questions

- [ ] Should incomplete weekly priorities auto-roll to next week?
- [ ] How to handle priorities that span multiple weeks?
- [ ] Should we track "streaks" (priority worked on 5 days in a row)?
- [ ] What if user sets daily intention NOT from weekly priorities? (Flag as "off-track"?)
