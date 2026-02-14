# Voice-First Audit: AMK Command Center

**Auditor**: Voice Interface Expert (Alexa/Google Assistant background)
**Date**: 2026-02-13
**URL**: http://localhost:5173

---

## Executive Summary

**Voice Coverage**: 15%
**Voice-First Score**: 2/10 (Cannot use hands-free while driving)
**Critical Gap**: Voice is a **feature**, not the **foundation**

---

## Voice Coverage Analysis

### Current Voice Capabilities (15%)

1. ✅ **Voice transcription** - Works (Whisper Large V3)
2. ✅ **Journal entry creation** - Saves to markdown
3. ✅ **Data extraction** - Claude Sonnet 4.5 extracts structured data
4. ✅ **Audio playback** - Can review recording before saving

### What Requires Clicks (85%)

1. ❌ **Voice activation** - Must click green circle (NO keyboard shortcut)
2. ❌ **Habit tracking** - All 10 habits require clicks
3. ❌ **Task management** - Pause/complete tasks = clicks
4. ❌ **Date navigation** - Previous/next day arrows
5. ❌ **Energy level** - 4 buttons (high/medium/low/drained)
6. ❌ **Sleep tracking** - Manual text input for times
7. ❌ **Intentions** - Add/remove requires clicks
8. ❌ **Coach challenges** - Expand/collapse = clicks
9. ❌ **People navigation** - Filter/search requires typing
10. ❌ **Tab switching** - 4 navigation buttons

---

## Click → Voice Opportunities (Ranked by Impact)

### High Impact (Daily Actions)

#### 1. **Habit Tracking** (Current: 10 clicks/day → Voice: "Mark running complete")

- **Impact**: HIGH
- **Frequency**: DAILY (10 habits × 365 days = 3,650 clicks/year)
- **Voice Command**:
  - "Mark running complete" → Increments 🏃 counter
  - "I did journaling today" → Increments 📝 counter
  - "Completed sauna session" → Increments 🧖 counter
- **Why it matters**: Highest-frequency action in app

#### 2. **Task Management** (Current: 3+ clicks → Voice: "Pause Leon proposal")

- **Impact**: HIGH
- **Frequency**: DAILY (urgent tasks managed 5-10x/day)
- **Voice Command**:
  - "Pause Leon proposal" → Pauses task
  - "Complete Leon proposal" → Marks done
  - "What's urgent today?" → Reads top 3 urgent items
- **Why it matters**: Core productivity workflow

#### 3. **Energy Level** (Current: 1 click → Voice: "Energy is high today")

- **Impact**: MEDIUM
- **Frequency**: DAILY
- **Voice Command**:
  - "Energy is high today" → Selects "high"
  - "Feeling drained" → Selects "drained"
- **Why it matters**: Journal entry requirement

#### 4. **Date Navigation** (Current: 2 clicks → Voice: "Show yesterday")

- **Impact**: MEDIUM
- **Frequency**: DAILY (reviewing past days)
- **Voice Command**:
  - "Show yesterday" → Navigate to 2026-02-12
  - "Jump to Monday" → Navigate to last Monday
  - "Back to today" → Return to current date
- **Why it matters**: Common review pattern

### Medium Impact (Weekly Actions)

#### 5. **Coach Challenges** (Current: 1 click/expand → Voice: "What does Bill Campbell say?")

- **Impact**: MEDIUM
- **Frequency**: WEEKLY
- **Voice Command**:
  - "What does Bill Campbell say?" → Reads challenge
  - "Tell me more about Peter Drucker's advice" → Expands context
  - "Ignore Machiavelli" → Dismisses coach
- **Why it matters**: Learning engagement

#### 6. **Tab Switching** (Current: 1 click → Voice: "Show People Intelligence")

- **Impact**: MEDIUM
- **Frequency**: WEEKLY
- **Voice Command**:
  - "Show People Intelligence" → Switch to People tab
  - "Go to Weekly Strategy" → Switch to Weekly tab
  - "Back to Daily AI" → Switch to Daily tab
- **Why it matters**: Context switching friction

### Low Impact (Rare Actions)

#### 7. **Intentions Management** (Current: 2 clicks → Voice: "Add intention: Call Leon")

- **Impact**: LOW
- **Frequency**: RARE (set 1-2x/week)
- **Voice Command**:
  - "Add intention: Call Leon" → Creates new intention
  - "Remove intention: Em Höttche website" → Deletes intention

---

## Voice UX Issues (Where Voice Would Fail Today)

### 1. **No Audio Feedback** ❌

**Problem**: System doesn't confirm what it heard
**Example**: User says "Mark running complete" → Zero audio response
**Fix Needed**: "Running marked complete. 4 days this month."

### 2. **No Error Recovery** ❌

**Problem**: Misheard commands require manual correction
**Example**: System hears "Market running" instead of "Mark it running"
**Fix Needed**: "Did you mean 'Mark running complete'? Say yes or no."

### 3. **No Disambiguation** ❌

**Problem**: Multiple matches, no way to clarify via voice
**Example**: "Pause Leon" → Which Leon task? (3 exist)
**Fix Needed**: "I found 3 tasks about Leon. Say 1, 2, or 3."

### 4. **Silent Success States** ❌

**Problem**: UI updates but no audio confirmation
**Example**: Click habit → Counter increments silently
**Fix Needed**: Audible "ding" + "Running: 4 days"

### 5. **Voice Activation Requires Click** ❌

**Problem**: Green circle NOT accessible via keyboard shortcut
**Example**: Cannot trigger voice while driving (hands on wheel)
**Fix Needed**: Global hotkey (Cmd+Shift+V) or wake word ("Hey Nexus")

### 6. **No Conversational Context** ❌

**Problem**: Each command isolated, no multi-turn dialogue
**Example**:

- User: "What's urgent?"
- System: [Shows 3 tasks]
- User: "Pause the second one"
- System: ❌ No context from previous question

**Fix Needed**: Maintain conversation state for 2-3 turns

---

## Voice-First Redesign (If Voice Was Primary)

### 1. **Chat Position** → **Center Screen, Always Visible**

**Current**: Chat at top, small, easy to miss
**Voice-First**: Chat fills 60% of screen, messages large/readable
**Why**: Voice transcription IS the primary interaction, not a side feature

### 2. **Buttons That Disappear**

- ❌ Previous/Next day arrows → Voice: "Show yesterday"
- ❌ Energy level buttons → Voice: "Energy is high"
- ❌ Habit icons → Voice: "Mark running complete"
- ❌ "+ Add" intention → Voice: "Add intention: X"
- ❌ Pause/Complete task buttons → Voice: "Pause Leon task"

**What Stays**:

- ✅ Save Entry (fallback for edge cases)
- ✅ Logout (security)
- ✅ Expand coach challenges (visual learning)

### 3. **Audio Feedback System**

Every voice command gets:

1. **Confirmation Sound** (0.1s "ding")
2. **Verbal Echo** (0.5s "Running marked complete")
3. **Status Update** (1s "You've run 4 days this month")

**Example Flow**:

```
User: "Mark running complete"
System: [DING] → "Running marked complete. 4 days this month." → [Shows updated streak]
```

### 4. **Wake Word vs Hotkey**

**Option A - Wake Word**: "Hey Nexus" (always listening)

- ✅ Truly hands-free
- ❌ Privacy concerns
- ❌ False positives ("Alexa" problem)

**Option B - Hotkey**: Cmd+Shift+V or Space Bar (hold to talk)

- ✅ Privacy-preserving
- ✅ No false triggers
- ❌ Requires one hand briefly

**Recommendation**: Hotkey (Space Bar hold-to-talk like Walkie Talkie)

### 5. **Visual Feedback During Voice**

**Current**: Nothing happens while recording
**Voice-First**:

- Waveform animation (shows you're being heard)
- Live partial transcription (shows what's being captured)
- Confidence meter (low confidence = ask for repeat)

---

## Wispr.ai Comparison

### Wispr Flow (Voice-First Journal)

1. **Wake Word**: "Hey Wispr" → Starts listening (NO click)
2. **Continuous Recording**: Records until silence detected (NO stop button)
3. **Auto-Save**: Transcription saved automatically (NO save button)
4. **Audio Playback**: Default OFF (trust the AI, review later if needed)

### AMK Command Center Flow (Click-First)

1. **Click Green Circle** → Opens modal (requires hand)
2. **Click Start Recording** → Starts listening (2 clicks total)
3. **Click Stop** → Ends recording
4. **Click Save Entry** → Saves to journal (4 clicks total)
5. **Audio Playback**: Always shown (assumes user will review)

### Gap Analysis

| Feature              | Wispr.ai             | AMK Command Center           | Gap                     |
| -------------------- | -------------------- | ---------------------------- | ----------------------- |
| **Voice Activation** | Wake word (0 clicks) | Click green circle (1 click) | ⚠️ Not hands-free       |
| **Recording Start**  | Auto on wake word    | Click button (1 click)       | ⚠️ Extra step           |
| **Recording Stop**   | Silence detection    | Click button (1 click)       | ⚠️ Manual intervention  |
| **Save Flow**        | Auto-save            | Click Save (1 click)         | ⚠️ Extra confirmation   |
| **Total Clicks**     | **0**                | **4**                        | 🚨 **4x friction**      |
| **Audio Feedback**   | Verbal confirmations | Silent UI updates            | 🚨 **No accessibility** |
| **Hands-Free**       | ✅ 100%              | ❌ 0%                        | 🚨 **Cannot drive**     |

---

## Voice-First Score: 2/10

### Can You Use This 100% Hands-Free While Driving?

**NO** ❌

**Blockers**:

1. Must click green circle to activate voice (hands required)
2. No keyboard shortcut or wake word
3. No audio feedback (must look at screen to confirm actions)
4. No voice commands for habits, tasks, navigation (all require clicks)
5. Cannot recover from misheard commands via voice

**What Works**:

- ✅ Journal entry transcription (IF you can click to start)
- ✅ Data extraction from voice (IF you can click Save)

**What Doesn't Work**:

- ❌ Habit tracking while cooking dinner (hands dirty)
- ❌ Task management while on a run (phone in pocket)
- ❌ Energy logging while driving (unsafe to touch screen)
- ❌ Review yesterday's entry while folding laundry (hands busy)

---

## Is "Voice + 100% Traceability" True Today?

### Voice: ⚠️ **Partial**

- ✅ Voice **input** works (transcription quality high)
- ❌ Voice **control** doesn't exist (habits/tasks/navigation)
- ❌ Voice **feedback** missing (silent confirmations)

### 100% Traceability: ✅ **TRUE**

- ✅ All entries saved to markdown files
- ✅ Git-tracked journal entries
- ✅ Extracted data structured in frontmatter
- ✅ Coach challenges logged
- ✅ Timestamps preserved

**Verdict**:

- **Traceability**: 100% ✅
- **Voice-First**: 15% ⚠️

You have **voice input** with **perfect traceability**.
You do NOT have **voice-first** design (Wispr.ai level).

---

## Recommendations (Priority Order)

### P0 - Enable Hands-Free (Week 1)

1. **Add keyboard shortcut** (Cmd+Shift+V) → Triggers voice modal
2. **Audio confirmations** → TTS feedback for all actions
3. **Voice commands for habits** → "Mark X complete" pattern

### P1 - Core Voice Commands (Week 2)

4. **Task management** → "Pause/Complete [task name]"
5. **Date navigation** → "Show yesterday/Monday/today"
6. **Energy tracking** → "Energy is [level]"

### P2 - Advanced Voice UX (Week 3-4)

7. **Conversational context** → Multi-turn dialogues
8. **Error recovery** → "Did you mean X?"
9. **Wake word** (optional) → "Hey Nexus" for true hands-free

### P3 - Polish (Month 2)

10. **Waveform animation** → Visual feedback while recording
11. **Live transcription** → Show partial text as you speak
12. **Voice-first layout** → Chat-centric redesign

---

## Technical Implementation Notes

### Voice Command Router

```typescript
// Pseudocode - Voice command parser
function handleVoiceCommand(transcription: string) {
  // Habit tracking
  if (transcription.match(/mark (.*?) complete/i)) {
    const habit = extractHabit(transcription);
    incrementHabit(habit);
    speak(`${habit} marked complete. ${getStreak(habit)} days this month.`);
  }

  // Task management
  if (transcription.match(/pause (.*)/i)) {
    const taskName = extractTaskName(transcription);
    pauseTask(taskName);
    speak(`Paused: ${taskName}`);
  }

  // Date navigation
  if (transcription.match(/show (yesterday|today|monday)/i)) {
    const target = extractDate(transcription);
    navigateToDate(target);
    speak(`Showing ${target}`);
  }

  // Fallback to journal entry
  else {
    createJournalEntry(transcription);
  }
}
```

### Audio Feedback (TTS)

```typescript
function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.2; // Slightly faster for efficiency
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}
```

### Keyboard Shortcut

```typescript
// Global hotkey listener
document.addEventListener("keydown", (e) => {
  if (e.metaKey && e.shiftKey && e.key === "v") {
    e.preventDefault();
    showVoiceModal = true;
    startRecording();
  }
});
```

---

## Wispr.ai Lessons to Steal

1. **Zero-Click Recording** - Wake word or single hotkey, no modal
2. **Silence Detection** - Auto-stop when user stops talking
3. **Optimistic UI** - Show transcription immediately, correct later
4. **Audio-First Feedback** - Speak confirmations, don't just update UI
5. **Trust the AI** - Auto-save by default, manual review optional

---

## Success Metrics (Voice-First Transformation)

| Metric                     | Current   | Target (Voice-First) |
| -------------------------- | --------- | -------------------- |
| **Voice Coverage**         | 15%       | 80%                  |
| **Avg Clicks/Session**     | 12-15     | 0-2                  |
| **Hands-Free Capable**     | 0%        | 100%                 |
| **Audio Feedback**         | 0%        | 100%                 |
| **Voice Activation Speed** | 4 clicks  | 1 hotkey             |
| **Habit Tracking Speed**   | 10 clicks | 10 voice commands    |
| **Can Drive & Journal**    | ❌ No     | ✅ Yes               |

---

## Final Verdict

**Current State**: You built a **click-first app with voice input**.
**Voice-First Vision**: You need a **voice-first app with click fallback**.

The transcription quality is excellent (Whisper Large V3).
The data extraction is solid (Claude Sonnet 4.5).
The traceability is perfect (Git + Markdown).

**But you cannot use this while driving, cooking, or running.**

To honor "Voice-First Philosophy", implement:

1. Keyboard shortcut (P0)
2. Audio confirmations (P0)
3. Voice commands for habits/tasks (P0)

Then you'll have a **true voice-first journal**, not just a journal that accepts voice input.

---

**Auditor**: Voice Interface Expert
**Recommendation**: Implement P0 items (Week 1), then re-audit voice coverage.
**Expected Improvement**: 15% → 60% voice coverage with P0 alone.
