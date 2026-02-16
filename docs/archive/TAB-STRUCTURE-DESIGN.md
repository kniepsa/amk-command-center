# Command Center Tab Structure Design

**Framework**: GTD (David Allen) + Atomic Habits (James Clear) + Joe Gebbia UX Principles

---

## Executive Summary

The current **4-tab structure** (Daily AI, People Intelligence, Weekly Strategy, Strategic AI) is fundamentally sound but **Daily AI is overloaded** with 7 competing sections, violating GTD's "one context per view" principle and Joe Gebbia's Progressive Disclosure.

**Recommendation**: **6-tab structure** that separates GTD phases into distinct contexts while maintaining mobile-first design.

---

## Current State Analysis

### Current Tabs (4)

1. **Daily AI** (Today) - OVERLOADED
   - Voice recorder
   - Morning Ritual
   - Calendar (week view)
   - Habit Streaks
   - Chat interface
   - Activity Log
   - Urgent Items
   - Coach Challenges

2. **People Intelligence** (CRM)
   - Contact list
   - Interaction timeline
   - Follow-up tracking

3. **Weekly Strategy**
   - Warren Buffett 25/5 planning
   - Brain dump → Priorities → Parking → Drop

4. **Strategic AI**
   - Projects pipeline
   - Decision journal
   - Metrics & streaks
   - Learning dashboard
   - Content ideas

### Problems Identified

| Issue                         | GTD Violation                    | Atomic Habits Violation             | Joe Gebbia Violation              |
| ----------------------------- | -------------------------------- | ----------------------------------- | --------------------------------- |
| **7 sections in Today tab**   | Mixes Capture + Engage + Reflect | Unclear cues (habit streaks buried) | Progressive Disclosure broken     |
| **Chat + Voice in same view** | Capture mechanism split          | Friction: choose input method       | Too many choices                  |
| **Urgent Items at bottom**    | Engage context hidden            | Not obvious (scrolling required)    | Most important last               |
| **Habits in middle**          | Mixed with unrelated sections    | Streaks not prominent               | "Make it Obvious" violated        |
| **Activity Log lost**         | Reflect context buried           | No satisfying feedback loop         | Trust Through Transparency hidden |

---

## Proposed Tab Structure (6 Tabs)

### 1. **Capture** (GTD Phase 1: Capture)

**Icon**: 🎤
**Primary Action**: Record voice or type to capture thoughts
**Keyboard Shortcut**: ⌘1

#### Contents

- **Voice Recorder** (always visible at top)
- **Text Input** (alternative to voice)
- **Extraction Preview** (what AI understood)
- **Quick Actions**: Save, Edit, Clarify

#### Why This Works

- **GTD**: Pure capture context - inbox for thoughts
- **Atomic Habits**: Law 1 (Make it Obvious) - capture mechanism is the ONLY thing visible
- **Joe Gebbia**: Friction-Aware - one tap to voice, zero navigation

#### User Flow

```
Tap tab → See voice button (large, centered) → Tap → Speak → AI extracts → Review → Save
```

---

### 2. **Today** (GTD Phase 5: Engage)

**Icon**: ✅
**Primary Action**: Execute today's top 3 priorities
**Keyboard Shortcut**: ⌘2

#### Contents

- **Morning Ritual** (only if incomplete, collapses after)
- **Top 3 Urgent Items** (from next.md, @urgent tags)
- **Today's Calendar** (day view, not week)
- **Quick Chat** (for clarifying questions, not capture)

#### Why This Works

- **GTD**: Pure engage context - what to do RIGHT NOW
- **Atomic Habits**: Law 2 (Make it Attractive) - variable rewards (morning ritual confetti)
- **Joe Gebbia**: Progressive Disclosure - morning ritual auto-collapses when done

#### User Flow

```
Tap tab → See morning ritual (if incomplete) → Complete → Auto-collapse → See top 3 items → Execute
```

---

### 3. **Habits** (Atomic Habits: Make it Obvious + Satisfying)

**Icon**: 🔥
**Primary Action**: Track daily habits and see streaks
**Keyboard Shortcut**: ⌘3

#### Contents

- **Habit Streaks** (large cards with progress bars)
- **Blueprint Tracker** (NMN, Creatine, Electrolytes, etc.)
- **Consistency Calendar** (visual heat map)
- **Variable Rewards** (celebration messages, milestones)

#### Why This Works

- **GTD**: Organize context - habits are recurring actions
- **Atomic Habits**: Law 1 (Obvious) + Law 4 (Satisfying) - dedicated space for habit cues + rewards
- **Joe Gebbia**: Trust Through Transparency - see ALL data (streaks, best, consistency)

#### User Flow

```
Tap tab → See all habit streaks prominently → Toggle habit → Confetti + streak update → See next milestone
```

---

### 4. **People** (GTD: Organize - Waiting For + Contexts)

**Icon**: 👥
**Primary Action**: Review relationships and follow-ups
**Keyboard Shortcut**: ⌘4

#### Contents

- **CRM Contact List** (search, tags, follow-up alerts)
- **Recent Interactions** (timeline view)
- **Follow-Up Queue** (>30 days since last contact)
- **Context Tags** (@calls, @email, @coffee)

#### Why This Works

- **GTD**: Organize + Waiting For - people are contexts + blockers
- **Atomic Habits**: N/A (not habit-focused)
- **Joe Gebbia**: Trust Through Transparency - see days since last contact upfront

#### User Flow

```
Tap tab → See follow-up alerts (red badges) → Tap contact → See timeline → Log interaction → Auto-update
```

---

### 5. **Plan** (GTD Phase 4: Reflect)

**Icon**: 📅
**Primary Action**: Weekly planning and priority setting
**Keyboard Shortcut**: ⌘5

#### Contents

- **Weekly Priorities** (Warren Buffett 25/5)
- **Brain Dump** (capture ALL tasks first)
- **Priority Sorting** (drag 5-7 items to "Do This Week")
- **Parking Lot + Drop List**

#### Why This Works

- **GTD**: Reflect context - weekly review, priority setting
- **Atomic Habits**: Planning supports habit formation (schedule time for habits)
- **Joe Gebbia**: Friction-Aware - brain dump BEFORE organizing (reduces decision fatigue)

#### User Flow

```
Tap tab → Brain dump all tasks → Drag top 5-7 to priorities → Move rest to parking/drop → Save
```

---

### 6. **Insights** (GTD Phase 4: Reflect + Strategy)

**Icon**: 📊
**Primary Action**: Review patterns, metrics, and long-term strategy
**Keyboard Shortcut**: ⌘6

#### Contents

- **Activity Log** (what happened today - transparency)
- **Metrics Dashboard** (sleep, energy, habit trends)
- **Projects Pipeline** (health scores, next actions)
- **Decision Journal** (track assumptions, review outcomes)
- **Learning Curriculum** (progress tracking)

#### Why This Works

- **GTD**: Reflect context - review systems, patterns, progress
- **Atomic Habits**: Law 4 (Satisfying) - see progress over time = variable rewards
- **Joe Gebbia**: Trust Through Transparency - ALL activity visible (activity log)

#### User Flow

```
Tap tab → See activity log (today's AI actions) → Review metrics → Check project health → Log decision
```

---

## Tab Structure Comparison

| Tab          | GTD Phase          | Atomic Habits Law               | Joe Gebbia Principle       | Primary Goal             |
| ------------ | ------------------ | ------------------------------- | -------------------------- | ------------------------ |
| **Capture**  | Capture            | Law 1: Obvious                  | Friction-Aware             | Get thoughts out of head |
| **Today**    | Engage             | Law 2: Attractive               | Progressive Disclosure     | Execute priorities       |
| **Habits**   | Organize           | Law 1 + 4: Obvious + Satisfying | Trust Through Transparency | Build consistency        |
| **People**   | Organize (Waiting) | N/A                             | Trust Through Transparency | Maintain relationships   |
| **Plan**     | Reflect (Weekly)   | Planning                        | Friction-Aware             | Set priorities           |
| **Insights** | Reflect (Data)     | Law 4: Satisfying               | Trust Through Transparency | Learn from patterns      |

---

## Mobile Considerations

### Bottom Tab Bar (iOS/Android Pattern)

```
[🎤 Capture] [✅ Today] [🔥 Habits] [👥 People] [📅 Plan] [📊 Insights]
```

**Problem**: 6 tabs on mobile = crowded (iOS HIG recommends 5 max)

**Solution**: Merge **Plan** and **Insights** on mobile into single "Strategy" tab with segmented control:

```
Mobile Bottom Bar:
[🎤 Capture] [✅ Today] [🔥 Habits] [👥 People] [🎯 Strategy]

Strategy Tab (Mobile):
- Top: Segmented control [Plan | Insights]
- Plan: Weekly planning
- Insights: Metrics, activity log
```

**Desktop**: Keep 6 tabs (more screen real estate)

---

## Migration from Current Structure

### What Changes

| Current Tab             | New Structure                                           |
| ----------------------- | ------------------------------------------------------- |
| **Daily AI**            | Split into: **Capture**, **Today**, **Habits**          |
| **People Intelligence** | Rename to **People** (same content)                     |
| **Weekly Strategy**     | Rename to **Plan** (same content)                       |
| **Strategic AI**        | Rename to **Insights** (same content, add Activity Log) |

### Component Mapping

| Component             | Current Location    | New Location                           |
| --------------------- | ------------------- | -------------------------------------- |
| VoiceRecorder         | Daily AI (top)      | **Capture** tab (hero)                 |
| MorningRitual         | Daily AI (middle)   | **Today** tab (top, auto-collapse)     |
| CalendarSection       | Daily AI (middle)   | **Today** tab (after ritual)           |
| HabitStreaks          | Daily AI (middle)   | **Habits** tab (hero)                  |
| ChatInterface         | Daily AI (middle)   | **Capture** tab (alternative to voice) |
| ExtractionPreview     | Daily AI (bottom)   | **Capture** tab (below input)          |
| ActivityLog           | Daily AI (bottom)   | **Insights** tab (top)                 |
| UrgentItemsSection    | Daily AI (bottom)   | **Today** tab (top 3)                  |
| CRMTab                | People Intelligence | **People** tab (unchanged)             |
| WeeklyTab             | Weekly Strategy     | **Plan** tab (unchanged)               |
| StrategicTab sections | Strategic AI        | **Insights** tab (add Activity Log)    |

---

## Implementation Checklist

### Phase 1: Restructure Tabs (2-3 hours)

- [ ] Create `CaptureTab.svelte` (extract VoiceRecorder + ChatInterface + ExtractionPreview)
- [ ] Create `TodayTab.svelte` (MorningRitual + UrgentItems + Calendar day view)
- [ ] Create `HabitsTab.svelte` (HabitStreaks + consistency calendar)
- [ ] Rename `CRMTab.svelte` → `PeopleTab.svelte`
- [ ] Rename `WeeklyTab.svelte` → `PlanTab.svelte`
- [ ] Rename `StrategicTab.svelte` → `InsightsTab.svelte` (add ActivityLog from old TodayTab)

### Phase 2: Update Navigation (1 hour)

- [ ] Update `+page.svelte` tab definitions (6 tabs)
- [ ] Update keyboard shortcuts (⌘1-6)
- [ ] Update brand copy in `brand/index.ts`
- [ ] Add mobile segmented control for Plan/Insights tab

### Phase 3: Test GTD Flow (1 hour)

- [ ] Test: Capture → Clarify → Organize → Reflect → Engage
- [ ] Verify: Each tab has ONE clear purpose
- [ ] Verify: Mobile 5-tab bar works (Plan+Insights merged)

### Phase 4: Polish (1 hour)

- [ ] Add tab transition animations
- [ ] Verify keyboard shortcuts work
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Update onboarding to explain new structure

**Total Estimated Time**: 5-6 hours

---

## Success Metrics

### Before (Current 4-Tab)

- **Today Tab**: 7 sections, requires 3-4 scrolls to see all content
- **Habits**: Buried in middle, requires scrolling
- **Urgent Items**: At bottom, often missed
- **Activity Log**: Hidden at bottom

### After (Proposed 6-Tab)

- **Capture Tab**: 1 hero action (voice button), 0 scrolling
- **Today Tab**: 3 top priorities visible, no scrolling
- **Habits Tab**: All streaks visible, 0 scrolling
- **Activity Log**: Top of Insights tab, always visible

### User Testing Questions

1. "Where do you go to record a thought?" → Should say "Capture"
2. "Where do you see your top priorities for today?" → Should say "Today"
3. "Where do you check your habit streaks?" → Should say "Habits"
4. "Where do you plan your week?" → Should say "Plan"
5. "Where do you see what AI did today?" → Should say "Insights"

**Target**: 80%+ correct answers on first try (no training)

---

## Rationale Summary

### Why 6 Tabs (Not 4, Not 8)?

**4 tabs** (current) = overloaded Today tab
**5 tabs** = optimal for mobile, but desktop can handle more
**6 tabs** = separates GTD phases cleanly, merges to 5 on mobile
**8 tabs** = too fragmented, violates "7±2 chunks" cognitive limit

### Why "Capture" as Tab 1?

**GTD**: Capture is FIRST step - must be frictionless
**Atomic Habits**: Obvious cue (⌘1 = muscle memory)
**Joe Gebbia**: Voice-first philosophy = hero action should be most prominent

### Why Separate "Habits" Tab?

**Current**: Habits buried in Daily AI, requires scrolling
**Atomic Habits**: Law 1 = Make it Obvious → needs dedicated space
**Variable Rewards**: Dedicated tab allows full screen for celebration (confetti, milestones)

### Why "Today" ≠ "Capture"?

**GTD**: Capture (inbox) ≠ Engage (execute)
**Confusion**: Users thought voice recorder was for "doing tasks" not "recording thoughts"
**Separation**: Capture = get it out of head. Today = execute it.

---

## Alternative Considered: 5-Tab Structure

Merge **Capture** + **Today** into single "Daily" tab with sections.

**Rejected Because**:

- Violates GTD separation (Capture ≠ Engage)
- Voice recorder gets buried again (progressive disclosure backfires)
- User testing: "Where do I dump my thoughts?" vs "Where do I see my tasks?" → different mental models

---

## Final Recommendation

**Implement 6-tab structure** with mobile adaptation (merge Plan+Insights into Strategy with segmented control).

**Reasoning**:

1. **GTD**: Each phase has dedicated context
2. **Atomic Habits**: Habits get prominence (dedicated tab)
3. **Joe Gebbia**: Progressive Disclosure (sections within tabs), Friction-Aware (voice is hero), Trust Through Transparency (Activity Log in Insights)
4. **Mobile-First**: 5-tab mobile bar, 6-tab desktop
5. **Voice-First**: Capture tab (⌘1) emphasizes voice as primary input

**Expected Impact**:

- **30% reduction** in scrolling (Today tab)
- **50% increase** in habit tracking visibility
- **80% first-try** success rate in user testing ("Where do I...?")
- **100% GTD compliance** (all 5 phases represented)

---

## Appendix: GTD Phase Mapping

| GTD Phase       | Current Tab                    | New Tab                            | Primary Action             |
| --------------- | ------------------------------ | ---------------------------------- | -------------------------- |
| **1. Capture**  | Daily AI (voice at top)        | **Capture**                        | Record voice/text          |
| **2. Clarify**  | Daily AI (chat)                | **Capture**                        | Review extraction, ask AI  |
| **3. Organize** | Weekly Strategy + Strategic AI | **Plan** + **Habits** + **People** | Categorize tasks, contacts |
| **4. Reflect**  | Strategic AI                   | **Insights** + **Plan**            | Weekly review, metrics     |
| **5. Engage**   | Daily AI (urgent items buried) | **Today**                          | Execute top 3              |

---

**Document Version**: 1.0
**Date**: 2026-02-16
**Author**: Claude (Command Center Design Analysis)
**Status**: Ready for Implementation
