# PRD: Command Center V2 Architecture

**Status**: Planning
**Priority**: P0 (Critical - Foundation for all features)
**Owner**: AMK
**Created**: 2026-02-11

---

## Problem Statement

Current Command Center has **fundamental UX issues**:

1. ❌ No chat interface (everything is forms) → Violates "Voice-First" principle
2. ❌ No historic entries view → Can't review yesterday
3. ❌ Weekly/Daily are siloed → No priority sync
4. ❌ Habits only in morning → Can't track what was DONE
5. ❌ No learning curriculum → Sales Day 8/30 invisible
6. ❌ No AI coaches → Bill Campbell/Machiavelli missing

**Current**: 5 disconnected tabs (Morning, Evening, Weekly, CRM, Metrics)
**Desired**: Unified command center with chat-first UX, context-aware coaches, curriculum integration

---

## V2 Architecture Principles

### 1. Voice-First by Default

- **Primary input**: Chat box (paste voice transcripts, type naturally)
- **Secondary input**: Forms (only when chat extraction fails)
- **Auto-extraction**: Claude parses freeform text → Structured data

### 2. Context Over Forms

- Show relevant info based on time/context
- Morning: Sleep + Intentions + Weekly priorities
- Evening: Gratitude + Food + Tomorrow planning + Habit completion
- Don't make user navigate 5 tabs

### 3. Intelligence, Not Data Entry

- AI coaches challenge thinking (Campbell, Machiavelli, Drucker)
- Weekly priorities auto-suggest daily intentions
- Learning curriculum prompts: "📚 Day 8 ready (15 min)"

---

## New Information Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  AMK Command Center                        [@amk] [⚙️]      │
├─────────────────────────────────────────────────────────────┤
│  [Today ▾]  [Learning]  [CRM]  [Metrics]                    │
│                                                              │
│  Removed: Morning/Evening/Weekly (merged into "Today")      │
│  Added: Learning (curricula), Settings (coaches)            │
└─────────────────────────────────────────────────────────────┘
```

### Tab Structure (V2)

| Tab          | Purpose                | Replaces                           | Key Features                                      |
| ------------ | ---------------------- | ---------------------------------- | ------------------------------------------------- |
| **Today**    | Daily entry + planning | Morning + Evening + Weekly context | Chat interface, weekly priorities, habit tracking |
| **Learning** | Micro-curricula        | (New)                              | Sales Day 8/30, Socratic lessons, quiz            |
| **CRM**      | People & interactions  | (Unchanged)                        | Contact timeline, follow-up alerts                |
| **Metrics**  | Streaks & patterns     | (Unchanged)                        | Habit streaks, energy/sleep trends                |
| **Settings** | Preferences            | (New)                              | AI coaches config, curriculum selection           |

---

## Today Tab (V2) - Full Spec

### Layout (3-Column)

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Tuesday, Feb 11 2026           Week 06 Progress: 3/7 ✅ │
├─────────────────────────────────────────────────────────────┤
│  Left Sidebar (20%)    │  Chat (60%)        │ Right (20%)   │
│  ──────────────────────┼────────────────────┼────────────── │
│  🎯 Weekly Priorities  │  💬 Daily Entry    │ 📊 Extracted  │
│  1. Leon deal (Day 2)  │                    │ Data Preview  │
│  2. Sales Day 8 (2/7)  │  [Recent ▾]        │               │
│  3. Germany RE (0/7)   │  Today (Feb 11)    │ Sleep: 8.0h   │
│                        │                    │ Quality: Good │
│  📚 Today's Lesson     │  Morning Entry:    │               │
│  Day 8: Discovery      │  User: [paste]     │ Energy: High  │
│  [Start 15min]         │  "Ins Bett um      │               │
│                        │  22:00..."         │ Intentions:   │
│  ✅ Habits Tracker     │                    │ • Leon R25M   │
│  Running        [ ]    │  Claude: ✅        │ • Sales Day 8 │
│  Sauna          [ ]    │  Extracted sleep   │               │
│  Sales Learning [✓]    │  + energy data     │ Habits:       │
│  Journaling     [✓]    │                    │ ✅ Journaling │
│  Supplements    [✓]    │  ┌──────────────┐ │ ✅ Sales      │
│                        │  │ 🎭 Machiavelli│ │ [ ] Running  │
│  🧠 Coach Active:      │  │ Leon ghosting │ │ [ ] Sauna    │
│  • Machiavelli         │  │ for 7 days... │ │               │
│  • Bill Campbell       │  └──────────────┘ │ [Save Entry]  │
└────────────────────────┴────────────────────┴───────────────┘
```

### Key Interactions

1. **Chat-First Entry**
   - User pastes voice transcript OR types naturally
   - Claude extracts: sleep, energy, habits, intentions, gratitude, food
   - Preview appears in right sidebar
   - Click "Save" writes to `/entries/YYYY-MM-DD.md`

2. **Weekly Priority Sync**
   - Left sidebar shows this week's 5-7 priorities
   - Click "Use as Intentions" → Auto-fills intention fields
   - Mark habit complete → Updates weekly progress

3. **AI Coach Integration**
   - Coaches auto-activate based on keywords/context
   - Show challenges in chat (visually distinct cards)
   - User can ignore or engage

4. **Historic Entries**
   - Dropdown: [Today] [Yesterday] [Feb 10] [Feb 9] ... [Last 7 days]
   - Read-only view of past entries
   - Click "Edit" to reopen chat

5. **Habit Tracking (All Day)**
   - Left sidebar shows all 10 habits
   - Check off as completed throughout day
   - Morning: Plan which habits to do
   - Evening: Review what was actually done

---

## Learning Tab (V2) - Full Spec

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Learning Dashboard                        [⚙️ Settings]  │
├─────────────────────────────────────────────────────────────┤
│  Active: Sales (Day 8/30)              Progress: 26.7% ████ │
│                                                              │
│  🎯 Today's Lesson: Discovery Call Framework (15 min)       │
│  [▶️ Start Lesson]  [View Curriculum]  [Switch to Capital]  │
│                                                              │
│  📅 This Week:                                              │
│  Mon ✅ Day 7  |  Tue 📍 Day 8  |  Wed 🔒 Day 9              │
│                                                              │
│  🏆 Achievements: 7-Day Streak 🔥, Week 1 Complete ✅       │
└─────────────────────────────────────────────────────────────┘
```

**Details**: See [PRD-LEARNING-CURRICULUM.md](./PRD-LEARNING-CURRICULUM.md)

---

## Settings Tab (V2) - Full Spec

### Coach Configuration

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ AI Coaches & Challengers                                │
├─────────────────────────────────────────────────────────────┤
│  [✅] Bill Campbell - Direct leadership challenges          │
│       Challenge Level: [Low] [●Med] [High]                  │
│                                                              │
│  [✅] Machiavelli - Ruthless negotiation tactics            │
│       Challenge Level: [●Low] [Med] [High]                  │
│                                                              │
│  [✅] Peter Drucker - First principles thinking             │
│  [ ] Stoic Advisor - Emotional regulation                   │
│  [ ] Parenting Guru - Montessori-based insights             │
│  [ ] Sales Coach (SPIN) - Discovery questioning             │
│  [ ] M&A Advisor - Deal structuring                         │
│                                                              │
│  Advanced:                                                  │
│  [✅] Auto-activate coaches based on context                │
│  [ ] Allow coaches to debate each other                     │
│                                                              │
│  [💾 Save Preferences]                                      │
└─────────────────────────────────────────────────────────────┘
```

**Details**: See [PRD-AI-COACHES.md](./PRD-AI-COACHES.md)

---

## Migration Path (V1 → V2)

### Phase 1: Chat Interface (Week 1)

- [ ] Build TodayTab.svelte (replaces Morning/Evening/Weekly)
- [ ] Chat interface + extraction API
- [ ] Weekly priorities sidebar (read-only sync)

### Phase 2: Coaches + Learning (Week 2)

- [ ] Settings tab with coach configuration
- [ ] Coach challenges in chat UI
- [ ] Learning tab with curriculum dashboard

### Phase 3: Polish (Week 3)

- [ ] Historic entries dropdown
- [ ] Real-time extraction preview
- [ ] Habit tracker all-day mode
- [ ] Weekly progress updates

### Phase 4: Deprecate V1 (Week 4)

- [ ] Remove Morning/Evening/Weekly tabs
- [ ] Migrate existing data to new format
- [ ] Update documentation

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User Input (Chat)                                          │
│  "Ins Bett um 22:00, 8h geschlafen, gute Qualität..."      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Extraction API (/api/extract-entry)                        │
│  - Calls Claude with extraction prompt                      │
│  - Returns structured YAML                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Preview Sidebar (Right 20%)                                │
│  Shows extracted: sleep, energy, habits, intentions         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  User Clicks "Save Entry"                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  File Write: /users/amk/entries/2026-02-11.md              │
│  YAML frontmatter + markdown body                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Side Effects:                                              │
│  1. Update weekly progress (if intention linked)            │
│  2. Update habit streaks (if habits completed)              │
│  3. Trigger coach challenges (if keywords match)            │
│  4. Update learning progress (if curriculum mentioned)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Stack (Unchanged)

- **Frontend**: SvelteKit 5 (runes: $state, $derived)
- **Backend**: SvelteKit API routes + file system
- **AI**: Claude API (Sonnet 4.5)
- **Storage**: Markdown files in `/users/amk/`
- **Deploy**: Vercel (future: self-hosted for file access)

---

## Success Metrics (V2)

| Metric                         | Target                         | Timeframe    |
| ------------------------------ | ------------------------------ | ------------ |
| % entries via chat (not forms) | 80%                            | 2 weeks      |
| Daily active usage             | 90% (27/30 days)               | 1 month      |
| Coach engagement               | 60% sessions with ≥1 challenge | 2 weeks      |
| Learning completion rate       | 80% (24/30 days)               | 1 curriculum |
| Weekly→Daily sync adoption     | 70% intentions from weekly     | 2 weeks      |

---

## Risks & Mitigations

| Risk                                     | Impact | Mitigation                                       |
| ---------------------------------------- | ------ | ------------------------------------------------ |
| Chat extraction errors                   | High   | Always show preview, allow manual edit           |
| Too many features overwhelm              | Medium | Phase rollout, hide advanced features by default |
| File system conflicts (concurrent edits) | Medium | Optimistic locking, warn on conflicts            |
| Claude API costs spike                   | Low    | Cache common extractions, debounce requests      |

---

## Open Questions

- [ ] Should Today tab default to chat OR show structured form?
- [ ] How to handle multi-day entries? (Morning separate from Evening?)
- [ ] Should coaches be per-session OR persistent across days?
- [ ] Can users export data (CSV, JSON) for external analysis?
- [ ] Should we support voice recording in browser (not just paste transcripts)?

---

## Related PRDs

1. [PRD-CHAT-INTERFACE.md](./PRD-CHAT-INTERFACE.md) - Chat-first daily entry
2. [PRD-WEEKLY-DAILY-SYNC.md](./PRD-WEEKLY-DAILY-SYNC.md) - Weekly↔Daily priority sync
3. [PRD-AI-COACHES.md](./PRD-AI-COACHES.md) - Coach configuration & challenges
4. [PRD-LEARNING-CURRICULUM.md](./PRD-LEARNING-CURRICULUM.md) - Micro-learning system

---

## Next Steps

1. **Review with user** (AMK) - Validate architecture decisions
2. **Prioritize features** - Which PRD to implement first?
3. **Create wireframes** - High-fidelity mockups for Today tab
4. **Build Phase 1 MVP** - Chat interface + extraction (Week 1)
