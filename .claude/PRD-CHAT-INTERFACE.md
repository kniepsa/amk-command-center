# PRD: Chat-First Daily Entry Interface

**Status**: Planning
**Priority**: P0 (Critical - Core UX)
**Owner**: AMK
**Created**: 2026-02-11

---

## Problem Statement

The Command Center currently uses forms, but the journal system is **voice-first**. Users should be able to:

- Type/paste voice transcripts naturally
- Have Claude extract structure automatically (gratitude, food, habits, etc.)
- See live updates as they type

**Current**: Fill out 10+ form fields manually
**Desired**: Type "Dankbar für Jani. Gegessen um 12:00 300g Joghurt mit Beeren. Ins Bett um 22:00, 8h geschlafen, gute Qualität." → Auto-extracted

---

## Goals

1. **Primary**: Chat-first interface for daily entries (replaces Morning/Evening tabs)
2. **Secondary**: Show historic entries (last 7 days quick access)
3. **Tertiary**: Real-time extraction preview (show what Claude extracted)

---

## User Journeys

### Journey 1: Morning Voice Input

1. Open Command Center → "Today" tab (default)
2. See chat box with today's date header
3. Paste voice transcript from Voice Memos
4. Claude extracts: sleep, energy, habits planned, intentions
5. User reviews extracted data in sidebar
6. Click "Save to Journal"

### Journey 2: Evening Reflection

1. Open "Today" tab
2. Type: "Dankbar für Linus - er hat heute selbst seine Schuhe angezogen. Gegessen um 18:30 Lachs mit Gemüse."
3. Extracted gratitude + food appears in sidebar
4. Click "Add to Today's Entry"

### Journey 3: Review Yesterday

1. Click "Recent" dropdown → "Yesterday (2026-02-10)"
2. See full entry in read-only mode
3. Can click "Edit" to reopen chat for corrections

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  AMK Command Center                           [@amk] [⚙️]   │
├─────────────────────────────────────────────────────────────┤
│  [Today ▾]  [Weekly]  [Learning]  [CRM]  [Metrics]          │
├──────────────────────────┬──────────────────────────────────┤
│                          │  📅 2026-02-11                   │
│  Chat Area               │  ──────────────────────────────  │
│  (60% width)             │  Extracted Data Preview:         │
│                          │                                  │
│  2026-02-11 Morning      │  Sleep: 22:00 → 06:00 (8.0h)    │
│  ─────────────────────   │  Quality: Good                   │
│                          │                                  │
│  User: [paste voice]     │  Energy: High ⚡                 │
│  "Also ich bin ins Bett  │                                  │
│  um 22 Uhr gegangen..."  │  Intentions:                     │
│                          │  • Close Printulu deal with Leon │
│  Claude: Verstanden!     │  • Sales learning Day 8          │
│  Habe extrahiert:        │                                  │
│  - Sleep: 22:00-06:00    │  Habits Planned:                 │
│  - Energy: High          │  ✅ Running                      │
│  - 2 intentions          │  ✅ Journaling                   │
│                          │  ✅ Sales Learning               │
│  [Type here...]          │                                  │
│                          │  [💾 Save to Journal]            │
└──────────────────────────┴──────────────────────────────────┘
```

---

## Technical Implementation

### Phase 1: MVP (Week 1)

- [ ] New `TodayTab.svelte` component
- [ ] Chat interface with message history
- [ ] `/api/extract-entry` endpoint (calls Claude)
- [ ] Sidebar shows extracted YAML preview
- [ ] Save writes to `/users/amk/entries/YYYY-MM-DD.md`

### Phase 2: Polish (Week 2)

- [ ] Recent entries dropdown (last 7 days)
- [ ] Edit mode for past entries
- [ ] Auto-save draft to localStorage
- [ ] Undo/redo extraction

### Phase 3: Advanced (Week 3)

- [ ] Voice recording button (browser API)
- [ ] Real-time extraction (debounced)
- [ ] Suggested prompts ("Add gratitude", "Log food")

---

## API Spec

### POST `/api/extract-entry`

**Request:**

```json
{
  "date": "2026-02-11",
  "text": "Ins Bett um 22:00, 8h geschlafen...",
  "existing": {
    /* partial entry data */
  }
}
```

**Response:**

```json
{
  "extracted": {
    "sleep": { "bedtime": "22:00", "duration": "8.0", "quality": "good" },
    "energy": "high",
    "habits": { "running": true, "journaling": true },
    "intentions": ["Close Leon deal", "Sales learning Day 8"]
  },
  "confidence": 0.92,
  "suggestions": ["Did you mean 'gegessen' for food log?"]
}
```

---

## Success Metrics

- **Primary**: 80% of entries created via chat (not forms) within 2 weeks
- **Secondary**: <30s from voice transcript to saved entry
- **Tertiary**: 95%+ extraction accuracy (manual verification first week)

---

## Dependencies

- Claude API access (already configured)
- File system write access (`/users/amk/entries/`)
- YAML frontmatter parser

---

## Risks & Mitigations

| Risk                        | Mitigation                                                  |
| --------------------------- | ----------------------------------------------------------- |
| Extraction errors lose data | Always show preview before save, allow manual edit          |
| Claude API rate limits      | Cache common extractions, debounce requests                 |
| German language accuracy    | Include German examples in prompt, validate with test cases |

---

## Open Questions

- [ ] Should we support multiple entries per day? (Morning + Evening separate?)
- [ ] How to handle conflicts (user edits YAML directly, then uses chat)?
- [ ] Should extraction be real-time or on-demand (click "Extract" button)?
