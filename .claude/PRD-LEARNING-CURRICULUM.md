# PRD: Micro-Learning Curriculum System

**Status**: Planning
**Priority**: P2 (Medium - Strategic Growth)
**Owner**: AMK
**Created**: 2026-02-11

---

## Problem Statement

The journal system has **4 micro-learning curricula** (Sales, Capital Raising, Public Speaking, Vibe Coding) with 30 days each, but:

- No UI to see current progress (Sales Day 8/30)
- No daily prompts to complete today's lesson
- No way to mark lessons complete or skip
- No curriculum switching (Sales → Capital Raising)

**Current**: Progress tracked manually in `users/amk/learning/progress.md`
**Desired**: "Learning" tab shows today's lesson, quiz, and tracks completion automatically

---

## Goals

1. **Primary**: Learning tab with curriculum progress dashboard
2. **Secondary**: Daily lesson delivery (Socratic Q&A, not passive reading)
3. **Tertiary**: Spaced repetition for key concepts (review Day 1 on Day 15)

---

## Curricula (from CLAUDE.md)

| Curriculum          | Duration | Current Progress | Status |
| ------------------- | -------- | ---------------- | ------ |
| **Sales**           | 30 days  | Day 8/30         | Active |
| **Capital Raising** | 30 days  | Day 0/30         | Queued |
| **Public Speaking** | 30 days  | Day 0/30         | Queued |
| **Vibe Coding**     | 30 days  | Day 0/30         | Queued |

**Sales Curriculum Example (Days 8-11):**

- Day 8: Discovery Call Framework (SPIN)
- Day 9: Budget & Authority (BANT)
- Day 10: Handling Objections
- Day 11: Closing Techniques

---

## User Journeys

### Journey 1: Daily Lesson (Morning)

1. Open "Learning" tab
2. See "📚 Today's Lesson: Day 8 - Discovery Call Framework"
3. Click "Start Lesson" → Socratic dialogue begins
4. Coach asks: "What's the difference between Situation and Problem questions?"
5. User types answer → Coach validates + gives example
6. Lesson complete → Badge awarded, progress updated (8/30)

### Journey 2: Review Past Lessons

1. Click "Curriculum Library" → See all 30 days
2. Day 1-7 marked ✅ Green (complete)
3. Day 8 highlighted (today)
4. Day 9-30 grayed out (locked until sequential completion)
5. Click Day 5 "Revisit" → Quick quiz on key concepts

### Journey 3: Switch Curriculum

1. Complete Sales Day 30 → "🎉 Sales Mastery Complete!"
2. See "Start Next Curriculum" prompt
3. Choose: Capital Raising, Public Speaking, or Vibe Coding
4. Day 1 unlocks tomorrow

---

## UI Layout

### Learning Tab (Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Learning Dashboard                        [⚙️ Settings]  │
├─────────────────────────────────────────────────────────────┤
│  Active Curriculum: Sales (30 Days)            Day 8/30 ✅  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Progress: ████████░░░░░░░░░░░░░░░░░░░░░░░░░░  26.7%       │
│                                                              │
│  🎯 Today's Lesson: Day 8                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Discovery Call Framework (SPIN Selling)              │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  Master the art of discovery through:                │  │
│  │  • Situation questions (context gathering)           │  │
│  │  • Problem questions (pain identification)           │  │
│  │  • Implication questions (pain amplification)        │  │
│  │  • Need-payoff questions (solution visualization)    │  │
│  │                                                       │  │
│  │  Estimated time: 15 minutes                          │  │
│  │  [▶️ Start Lesson]                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  📅 This Week's Plan:                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mon Feb 10  ✅  Day 7: Value Proposition             │  │
│  │  Tue Feb 11  📍  Day 8: Discovery Framework (Today)   │  │
│  │  Wed Feb 12  🔒  Day 9: BANT (Budget/Authority)       │  │
│  │  Thu Feb 13  🔒  Day 10: Handling Objections          │  │
│  │  Fri Feb 14  🔒  Day 11: Closing Techniques           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  📊 Curriculum Library:                                     │
│  [View All 30 Days] [Switch Curriculum] [Review Completed] │
│                                                              │
│  🏆 Achievements:                                           │
│  • 7-Day Streak 🔥                                         │
│  • Week 1 Complete ✅                                       │
│  • Perfect Score on Day 5 Quiz 💯                          │
└─────────────────────────────────────────────────────────────┘
```

### Lesson Delivery (Socratic Q&A)

```
┌─────────────────────────────────────────────────────────────┐
│  Day 8: Discovery Call Framework            [Exit Lesson]   │
├─────────────────────────────────────────────────────────────┤
│  Coach: Let's start with Situation questions. These gather  │
│  context before diving into problems. Can you give me an    │
│  example of a good Situation question for Printulu buyers?  │
│                                                              │
│  User: "How many products do you currently offer?"          │
│                                                              │
│  Coach: Good start! That's data gathering. Now make it      │
│  strategic—what DECISION does this info help you make?      │
│  Try: "How do you currently add new products to your        │
│  catalog?" This reveals their PROCESS (manual? slow?).      │
│                                                              │
│  User: Ah! So Situation questions should reveal pain points │
│  in their current workflow, not just collect facts.         │
│                                                              │
│  Coach: Exactly! ✅ Now let's move to Problem questions...  │
│  ─────────────────────────────────────────────────────────  │
│  Progress: ████████░░░░░░░░░░░░░░░░  40% (2/5 sections)    │
│                                                              │
│  [Continue] [Review Key Points] [Skip to Quiz]              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Phase 1: MVP (Week 1)

- [ ] Learning tab with curriculum progress dashboard
- [ ] Daily lesson delivery (Socratic Q&A via Claude)
- [ ] Mark lessons complete → Update `/learning/progress.md`
- [ ] Show next 5 days preview

### Phase 2: Polish (Week 2)

- [ ] Curriculum library (all 30 days browsable)
- [ ] Quiz mode at end of each lesson (3-5 questions)
- [ ] Spaced repetition: Review Day 1 on Day 8, Day 15, Day 30

### Phase 3: Advanced (Week 3)

- [ ] Real-world practice prompts: "Apply today's lesson to Leon negotiation"
- [ ] Share progress to Notion (Rocks tracking)
- [ ] Custom curriculum creation (user-defined 30-day plans)

---

## Data Model

### Progress Tracking (`users/amk/learning/progress.md`)

```yaml
---
active_curriculum: sales
curricula:
  sales:
    start_date: 2026-02-03
    current_day: 8
    completed_days: [1, 2, 3, 4, 5, 6, 7]
    skipped_days: []
    quiz_scores:
      day_1: 5/5
      day_2: 4/5
      day_5: 5/5
      day_7: 3/5
    achievements:
      - 7_day_streak
      - week_1_complete
  capital_raising:
    status: queued
  public_speaking:
    status: queued
  vibe_coding:
    status: queued
---
# Learning Progress Log

## 2026-02-11 (Day 8: Discovery Framework)
- Completed Socratic dialogue on SPIN questions
- Quiz score: 4/5 (missed Implication vs Problem distinction)
- Applied to Jerome call script
- Time: 18 minutes
```

### Curriculum Content (`users/amk/learning/curricula/sales/day-08.md`)

```yaml
---
day: 8
title: Discovery Call Framework
curriculum: sales
estimated_time: 15
topics:
  - SPIN Selling
  - Situation Questions
  - Problem Questions
  - Implication Questions
  - Need-Payoff Questions
prerequisite: [day_7]
---

# Day 8: Discovery Call Framework

## Learning Objectives
- Distinguish 4 types of discovery questions
- Write 5 SPIN questions for your use case
- Avoid "premature pitching"

## Socratic Dialogue Script

### Act 1: Situation Questions
**Coach**: What's the purpose of Situation questions?
**Expected Answer**: Gather context before identifying problems
**Challenge**: "How is this different from Problem questions?"

### Act 2: Problem Questions
**Coach**: Give me an example of a Problem question for Printulu buyers.
**Expected Answer**: "What challenges do you face when...?"
**Challenge**: "How do you avoid making them defensive?"

[... 3 more acts ...]

## Quiz (5 questions)
1. Which question type amplifies pain?
   a) Situation  b) Problem  c) Implication  d) Need-Payoff
   **Answer**: c

[... 4 more questions ...]

## Real-World Practice
Apply today's lesson:
- Review your last sales call
- Identify 3 places you could have asked better discovery questions
- Rewrite them using SPIN framework
```

---

## API Spec

### GET `/api/learning/current`

**Response:**

```json
{
  "curriculum": "sales",
  "current_day": 8,
  "total_days": 30,
  "progress_percent": 26.7,
  "today_lesson": {
    "day": 8,
    "title": "Discovery Call Framework",
    "estimated_time": 15,
    "topics": ["SPIN Selling", "Situation Questions", "..."],
    "status": "not_started"
  },
  "this_week": [
    { "day": 7, "title": "Value Proposition", "status": "completed" },
    { "day": 8, "title": "Discovery Framework", "status": "in_progress" },
    { "day": 9, "title": "BANT", "status": "locked" }
  ]
}
```

### POST `/api/learning/complete`

**Request:**

```json
{
  "curriculum": "sales",
  "day": 8,
  "quiz_score": 4,
  "time_spent": 18,
  "notes": "Applied to Jerome call script"
}
```

**Response:**

```json
{
  "success": true,
  "new_progress": 8,
  "achievements_unlocked": ["week_2_started"],
  "next_lesson": {
    "day": 9,
    "title": "BANT",
    "unlocks_at": "2026-02-12"
  }
}
```

---

## Success Metrics

- **Primary**: 80% lesson completion rate (no more than 2 skipped days/month)
- **Secondary**: Average quiz score >4/5 across all lessons
- **Tertiary**: Users report applying lessons to real work (journal mentions)

---

## Dependencies

- Curriculum content files (`/learning/curricula/[name]/day-XX.md`)
- Progress tracking file (`progress.md`)
- Claude API for Socratic dialogue generation

---

## Risks & Mitigations

| Risk                                      | Mitigation                                                       |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Users skip lessons (not daily habit)      | Morning notification: "📚 Today's lesson ready (15 min)"         |
| Content is too generic (not personalized) | Coach references user's journal context (e.g., Leon negotiation) |
| Lessons feel like homework (boring)       | Socratic dialogue > passive reading, apply to real situations    |
| Users want to skip ahead                  | Allow "unlock all" mode but warn that spaced repetition is lost  |

---

## Open Questions

- [ ] Should lessons unlock daily (sequential) or all at once (self-paced)?
- [ ] How to handle missed days? (Auto-skip or block progress?)
- [ ] Should curriculum switch be automatic (finish Sales → start Capital Raising) or manual?
- [ ] Can users create custom curricula? (e.g., "30 Days of German Real Estate")
- [ ] Should we track "real-world application" via journal analysis? (Did user apply Day 8 to Jerome call?)

---

## Future Enhancements (Post-MVP)

- **Parenting Curriculum** (Bi-weekly themes for @linus, @anton, @cari)
- **Adaptive Difficulty** (If user scores 5/5 on quizzes, accelerate pace)
- **Community Sharing** (Export curriculum for other users)
- **AI-Generated Lessons** (User provides topic, Claude creates 30-day plan)
