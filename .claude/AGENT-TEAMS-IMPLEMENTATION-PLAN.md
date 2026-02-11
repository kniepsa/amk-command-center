# Agent Teams Implementation Plan - Command Center V2

**Status**: Ready to Execute
**Estimated Time**: 2 weeks (vs 4 weeks sequential)
**Cost**: ~4x tokens (acceptable for 2x speed)
**Created**: 2026-02-11

---

## Why Agent Teams for Command Center V2?

### Parallel Workstreams (4 Agents)

Instead of building sequentially:

```
Week 1: Chat Interface
Week 2: Weekly Sync
Week 3: AI Coaches
Week 4: Learning Curriculum
```

Build **simultaneously** with specialized agents:

```
Agent 1: Frontend Specialist → TodayTab.svelte (Chat UI)
Agent 2: Backend Specialist → API routes + Data sync
Agent 3: AI/Prompt Engineer → Coach personalities + extraction
Agent 4: UX/Content Designer → Learning curriculum + lessons
```

**Result**: 4 weeks → 2 weeks, ship faster

---

## Agent Team Structure

### Agent 1: Frontend Specialist ("Frontend")

**Expertise**: Svelte 5, reactive runes, UI components
**Responsibilities**:

- Build `TodayTab.svelte` with 3-column layout
- Chat interface component
- Extraction preview sidebar
- Historic entries dropdown
- Habit tracker (all-day mode)

**Deliverables**:

- `/src/lib/components/TodayTab.svelte`
- `/src/lib/components/ChatInterface.svelte`
- `/src/lib/components/WeeklyPrioritiesSidebar.svelte`
- `/src/lib/components/ExtractionPreview.svelte`

**Dependencies**:

- Needs API routes from Agent 2
- Needs coach card UI specs from Agent 3

---

### Agent 2: Backend Specialist ("Backend")

**Expertise**: SvelteKit API routes, file system, data modeling
**Responsibilities**:

- `/api/extract-entry` endpoint (Claude integration)
- `/api/weekly/current` (read weekly plans)
- `/api/daily/link-weekly` (update progress)
- File system read/write for entries
- YAML frontmatter parsing

**Deliverables**:

- `/src/routes/api/extract-entry/+server.ts`
- `/src/routes/api/weekly/current/+server.ts`
- `/src/routes/api/daily/link-weekly/+server.ts`
- `/src/lib/server/file-utils.ts`

**Dependencies**:

- Needs data model specs from PRDs
- Coordinates with Agent 3 on extraction prompts

---

### Agent 3: AI/Prompt Engineer ("Coach")

**Expertise**: Claude API, prompt engineering, coach personalities
**Responsibilities**:

- Coach configuration system (`coaches.json`)
- Coach prompt templates (Campbell, Machiavelli, Drucker)
- Context-aware coach activation logic
- Coach card UI components
- Extraction prompt optimization (German/English)

**Deliverables**:

- `/src/lib/coaches/` (all coach modules)
- `/src/lib/components/CoachChallenge.svelte`
- `/src/routes/settings/coaches/+page.svelte`
- `/src/lib/prompts/extraction.ts`

**Dependencies**:

- Needs API infrastructure from Agent 2
- Needs UI slots from Agent 1

---

### Agent 4: UX/Content Designer ("Learning")

**Expertise**: Curriculum design, Socratic dialogue, UX flows
**Responsibilities**:

- Learning tab dashboard
- Socratic lesson delivery UI
- Quiz system
- Curriculum content (Sales Days 8-30)
- Progress tracking

**Deliverables**:

- `/src/lib/components/LearningTab.svelte`
- `/src/lib/components/SocraticLesson.svelte`
- `/users/amk/learning/curricula/sales/day-08.md` to `day-30.md`
- `/src/routes/api/learning/current/+server.ts`

**Dependencies**:

- Minimal (mostly standalone)
- Integrates with Today tab via "Today's Lesson" widget

---

## Phase 1: Foundation (Days 1-3)

### Parallel Tasks

**Agent 1 (Frontend)**: Build TodayTab shell + 3-column layout

```svelte
<!-- Basic structure, no data yet -->
<TodayTab>
  <WeeklySidebar slot="left" />
  <ChatInterface slot="center" />
  <ExtractionPreview slot="right" />
</TodayTab>
```

**Agent 2 (Backend)**: Build API routes (mock data initially)

```typescript
// /api/extract-entry - Returns mock extraction
POST { text: "..." } → { sleep: {...}, energy: "high" }

// /api/weekly/current - Returns mock priorities
GET → { priorities: [...], week: "2026-W06" }
```

**Agent 3 (Coach)**: Define coach data model + prompt templates

```typescript
// /lib/coaches/machiavelli.ts
export const machiavelliPrompt = `
You are Niccolò Machiavelli...
[Full prompt template]
`;
```

**Agent 4 (Learning)**: Design curriculum content structure

```yaml
# /learning/curricula/sales/day-08.md
---
day: 8
title: Discovery Call Framework
topics: [SPIN, Situation, Problem, Implication, Need-Payoff]
---
```

### Integration Point (Day 3)

- **Standup**: All 4 agents sync on data models
- **Resolve**: API contracts (request/response formats)
- **Test**: Frontend can call Backend APIs (even with mock data)

---

## Phase 2: Core Features (Days 4-7)

### Parallel Tasks

**Agent 1 (Frontend)**:

- Chat message rendering
- Extraction preview updates
- Weekly priorities clickable ("Use as Intentions")
- Habit tracker checkboxes

**Agent 2 (Backend)**:

- Real Claude API integration for extraction
- File system read/write (`/users/amk/entries/`)
- Weekly progress update logic
- YAML parsing (frontmatter)

**Agent 3 (Coach)**:

- Coach challenge cards in chat
- Settings page (enable/disable coaches)
- Context detection (keywords → coach activation)
- Challenge level filtering

**Agent 4 (Learning)**:

- Learning tab dashboard UI
- Socratic lesson dialogue system
- Quiz component
- Progress bar + achievements

### Integration Point (Day 7)

- **Standup**: Demo full flow end-to-end
- **Test**: User types → Extract → Preview → Save → Weekly updates
- **Test**: Coach challenges appear in chat
- **Test**: Learning lesson can be started/completed

---

## Phase 3: Polish (Days 8-10)

### Parallel Tasks

**Agent 1 (Frontend)**:

- Historic entries dropdown
- Responsive design (mobile)
- Loading states + error handling
- Animations (coach cards slide in)

**Agent 2 (Backend)**:

- Error handling (file conflicts, API failures)
- Optimistic locking (concurrent edits)
- Caching (debounce extraction requests)

**Agent 3 (Coach)**:

- Coach debates (experimental)
- Auto-activate logic refinement
- Coach memory (remember past challenges?)

**Agent 4 (Learning)**:

- Spaced repetition algorithm
- Real-world practice prompts
- Curriculum switching UI

### Integration Point (Day 10)

- **Final Review**: All features working together
- **User Testing**: AMK tries full workflow
- **Bugfixes**: Parallel debugging (split tasks by agent)

---

## How to Run Agent Teams

### Option 1: Split-Panes Mode (Visual)

```bash
# In Claude Code, press Cmd+Shift+P
# Select: "Agent Teams: Start Session (Split Panes)"

# You'll see 4 panes:
┌─────────────┬─────────────┐
│  Agent 1    │  Agent 2    │
│  Frontend   │  Backend    │
├─────────────┼─────────────┤
│  Agent 3    │  Agent 4    │
│  Coach      │  Learning   │
└─────────────┴─────────────┘

# Give instructions to all 4 at once:
"Agent 1: Build TodayTab layout
 Agent 2: Create /api/extract-entry endpoint
 Agent 3: Define coach prompts
 Agent 4: Design curriculum structure"
```

### Option 2: In-Process Mode (Shift+Up/Down)

```bash
# Press Shift+Up to spawn agent
# Press Shift+Down to view agent results
# Agents run in background, you coordinate

# Example workflow:
1. Shift+Up → "Agent 1: Build TodayTab" → Enter
2. Shift+Up → "Agent 2: Build API routes" → Enter
3. Shift+Up → "Agent 3: Coach prompts" → Enter
4. Shift+Up → "Agent 4: Curriculum design" → Enter
5. Wait 2-3 minutes...
6. Shift+Down → Review Agent 1 output
7. Shift+Down → Review Agent 2 output
   (repeat for all 4)
```

---

## Coordination Strategy

### Daily Standups (Virtual)

Every 2-3 days, have agents sync:

```markdown
**Day 3 Standup Prompt:**

Agent 1 (Frontend): What data do you need from Agent 2's API?
Agent 2 (Backend): What's the exact request/response format?
Agent 3 (Coach): Where do coach cards render in Agent 1's UI?
Agent 4 (Learning): How does "Today's Lesson" integrate with TodayTab?

Resolve conflicts, finalize contracts, update PRDs if needed.
```

### Integration Points

- **Day 3**: API contracts finalized
- **Day 7**: Full flow demo (all agents integrated)
- **Day 10**: Final polish + ship

---

## Cost Estimation

### Token Usage

- **Normal sequential**: ~500K tokens (1 agent × 4 weeks)
- **Agent Teams (4 agents)**: ~2M tokens (4x parallel)
- **Cost**: $20-30 total (acceptable for 2x speed)

### Time Savings

- **Sequential**: 4 weeks (160 hours)
- **Parallel**: 2 weeks (80 hours)
- **Savings**: 80 hours (~$8K value at $100/hr consulting rate)

**ROI**: Spend $30 on tokens, save $8K in time → 266x ROI

---

## Risk Mitigation

### Risk: Agents work on conflicting code

**Mitigation**: Clear file ownership (each agent owns different files)

- Agent 1: `/lib/components/*.svelte` (UI)
- Agent 2: `/routes/api/**/*.ts` (Backend)
- Agent 3: `/lib/coaches/**/*.ts` (Coaches)
- Agent 4: `/learning/curricula/**/*.md` (Content)

### Risk: Integration failures (agents' code doesn't work together)

**Mitigation**: Day 3 standup + API contracts

- Define TypeScript interfaces early
- Mock data for frontend testing
- Integration tests on Day 7

### Risk: One agent falls behind (blocks others)

**Mitigation**: Mocking + loose coupling

- Frontend works with mock APIs initially
- Backend exposes APIs even if logic incomplete
- Coaches can be added later (not blocking)

---

## Success Metrics

| Metric               | Target            | Measurement                              |
| -------------------- | ----------------- | ---------------------------------------- |
| Time to MVP          | 10 days           | Calendar days from start to working demo |
| Agent utilization    | 80% parallel work | Hours of parallel work / total hours     |
| Integration bugs     | <10               | Bugs caused by agent coordination issues |
| Token efficiency     | 4x max            | Total tokens / sequential baseline       |
| Feature completeness | 90%               | Features from PRDs implemented           |

---

## Next Steps

1. **Confirm approach** with AMK (you!)
2. **Assign agent roles** (Frontend, Backend, Coach, Learning)
3. **Kick off Day 1** (parallel foundation work)
4. **Day 3 standup** (sync on API contracts)
5. **Day 7 demo** (full integration test)
6. **Day 10 ship** (Command Center V2 live)

---

## Ready to Start?

I can launch Agent Teams **right now** with this command structure:

```bash
# Spawn 4 agents in parallel:

Agent 1 (Frontend):
"Build TodayTab.svelte with 3-column layout (WeeklySidebar, ChatInterface, ExtractionPreview). Use Svelte 5 runes. Mock data for now. See PRD-CHAT-INTERFACE.md"

Agent 2 (Backend):
"Create /api/extract-entry endpoint. Accept {text, date}, return {sleep, energy, habits, intentions}. Use Claude API. See PRD-CHAT-INTERFACE.md"

Agent 3 (Coach):
"Design coach system: coaches.json data model, prompt templates for Machiavelli/Campbell/Drucker. See PRD-AI-COACHES.md"

Agent 4 (Learning):
"Create LearningTab.svelte dashboard showing Sales Day 8/30 progress. See PRD-LEARNING-CURRICULUM.md"
```

**Should I launch all 4 agents now?** (This will start Command Center V2 implementation in parallel)
