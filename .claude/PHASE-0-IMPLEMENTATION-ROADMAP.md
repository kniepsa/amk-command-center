# Phase 0 Implementation Roadmap

**Total Estimate**: 16.5 hours (2 days)
**Expert Score Target**: All 8+/10
**Completion Criteria**: Pass driving test (eyes-free morning ritual)

---

## 🚀 QUICK WINS (2.5 hours) - START HERE

### Phase 0.1: Audio Feedback for Clarify (2 hours)

**Files to Create**:

- None (all components exist)

**Files to Modify** (4 files):

1. **`src/lib/utils/tts.ts`** (20 min)

   ```typescript
   // Add speakPrompt() with interrupt support
   export async function speakPrompt(
     message: string,
     options?: { interrupt?: boolean; rate?: number; pitch?: number },
   ): Promise<void>;
   ```

2. **`src/lib/utils/voice-commands.ts`** (30 min)

   ```typescript
   // Add parseClarifyCommand() function
   export function parseClarifyCommand(text: string): ClarifyCommand | null;

   // Types: 'confirm' | 'edit' | 'selectOption' | 'cancel'
   ```

3. **`src/lib/components/ClarifyModal.svelte`** (45 min)
   - Line 7: Add `onVoiceCommand` prop
   - Line 12: Add `playAudio` prop (default true)
   - Lines 38-45: Add `onMount()` with audio feedback
   - Lines 123-160: Add `handleVoiceCommand()` (already exists, wire up)
   - Lines 312+: Add keyboard handler (`svelte:window onkeydown`)

4. **`src/lib/components/TodayTab.svelte`** (25 min)
   - Line 234-239: Add `speakPrompt()` call when modal opens
   - Line 651-657: Pass `onVoiceCommand` + `playAudio` props to modal
   - NEW function: `handleClarifyVoiceCommand(text: string)`

**Testing** (10 min):

```bash
# Manual test checklist
- [ ] Voice: "looks good" → saves entry
- [ ] Voice: "first option" → selects first uncertain field option
- [ ] Voice: "edit energy" → opens edit dialog for energy field
- [ ] Keyboard: Esc → closes modal
- [ ] Keyboard: Enter → saves (if no uncertainties)
- [ ] Audio: Plays "Please review N fields" on mount
```

**Success Criteria**:

- ✅ Audio feedback plays without click
- ✅ All 4 voice commands work
- ✅ Keyboard shortcuts work
- ✅ GTD score increases 34 → 40 (partial)

---

### Phase 0.2: Complete Undo Integration (30 min)

**Files to Modify** (2 files):

1. **`src/lib/components/QuickEntrySection.svelte`** (or wherever entry save happens) (15 min)

   ```typescript
   async function handleEntrySave(entry: Entry) {
     const previousEntry = { ...entry };

     recordAction({
       type: 'entry-save',
       description: 'Entry saved',
       reverseAction: async () => {
         // Revert entry
         await fetch('/api/entries/revert', {
           method: 'POST',
           body: JSON.stringify({ entryId: entry.id, data: previousEntry })
         });
       },
       data: { entryId: entry.id, previousEntry }
     });

     await fetch('/api/entries/save', { ... });
   }
   ```

2. **`src/routes/weekly-review/+page.svelte`** (15 min)
   - Line 294-357: Step 2 - Wrap categorization with `recordAction()`
   - Line 359-430: Step 3 - Wrap priority selection with `recordAction()`

**Testing** (5 min):

```bash
# Manual test checklist
- [ ] Voice: "mark running" → "undo" → running unchecked
- [ ] Keyboard: Cmd+Shift+Z undoes last action
- [ ] Entry save → undo → entry reverts
- [ ] Weekly categorization → undo → item back in inbox
```

**Success Criteria**:

- ✅ Undo works for 95%+ of app actions
- ✅ Voice-First score increases 9.5 → 10

---

## 🎯 CORE FEATURES (10 hours)

### Phase 0.3: Weekly Review Voice + Notifications (6 hours)

#### Part A: Voice Inbox Categorizer (2 hours)

**Files to Create** (1 file):

1. **`src/lib/components/VoiceInboxCategorizer.svelte`** (2 hours)
   - Copy structure from `VoicePriorityPicker.svelte`
   - Change commands: "this week", "delegate", "someday", "drop"
   - Add 4 category buttons (manual fallback)
   - Add progress indicator: "3 of 8 items categorized"

   ```typescript
   async function readNextInboxItem() {
     if (currentIndex >= items.length) {
       speak("Inbox cleared!");
       onComplete();
       return;
     }

     const item = items[currentIndex];
     speak(`Item ${currentIndex + 1}: ${item.title}`);

     const response = await listenForResponse(
       ["this week", "delegate", "someday", "drop", "skip"],
       10000,
     );

     if (response) {
       categorizeItem(item, response);
       currentIndex++;
       await readNextInboxItem();
     }
   }
   ```

**Testing** (30 min):

```bash
# Manual test
- [ ] Voice mode: Reads all 8 inbox items
- [ ] Voice: "this week" → moves item to This Week
- [ ] Voice: "delegate" → moves item to Delegate
- [ ] Voice: "skip" → leaves in inbox, moves to next
- [ ] Manual mode: Click buttons work
```

#### Part B: Notification Trigger (1.5 hours)

**Files to Create** (1 file):

1. **`src/lib/utils/weekly-review-trigger.ts`** (1.5 hours)

   ```typescript
   export function scheduleWeeklyReview(): void {
     // Request permission
     Notification.requestPermission().then((permission) => {
       if (permission === "granted") {
         // Schedule Sunday 18:00
         const nextSunday = getNextSunday();
         nextSunday.setHours(18, 0, 0, 0);

         const delay = nextSunday.getTime() - Date.now();

         setTimeout(() => {
           navigator.serviceWorker.ready.then((registration) => {
             registration.showNotification("Weekly Review Time", {
               body: "15 minutes to reset and refocus",
               tag: "weekly-review",
               requireInteraction: true,
             });
           });
         }, delay);
       }
     });
   }

   export function checkWeeklyReviewDue(): boolean {
     const lastReview = localStorage.getItem("last_weekly_review_date");
     const lastDate = lastReview ? new Date(lastReview) : null;

     const now = new Date();
     const currentWeek = getISOWeekNumber(now);
     const lastWeek = lastDate ? getISOWeekNumber(lastDate) : null;

     return currentWeek !== lastWeek;
   }

   export function markWeeklyReviewComplete(): void {
     localStorage.setItem("last_weekly_review_date", new Date().toISOString());
   }
   ```

**Testing** (30 min):

```bash
# Manual test
- [ ] Set last review to last week
- [ ] checkWeeklyReviewDue() returns true
- [ ] Dashboard shows "Weekly Review Due" card
- [ ] Click notification → navigates to /weekly-review
```

#### Part C: Service Worker Integration (1 hour)

**Files to Modify** (1 file):

1. **`static/service-worker.js`** (1 hour)

   ```javascript
   self.addEventListener("notificationclick", (event) => {
     event.notification.close();

     if (event.notification.tag === "weekly-review") {
       event.waitUntil(clients.openWindow("/weekly-review"));
     }
   });
   ```

#### Part D: Dashboard Card (30 min)

**Files to Modify** (1 file):

1. **`src/routes/+page.svelte`** (30 min)
   - Line 7: Import `checkWeeklyReviewDue`
   - Line 11: Add `isWeeklyReviewDue` state
   - Line 45-71: Check on mount
   - Line 98: Add card when due

   ```svelte
   {#if isWeeklyReviewDue}
     <div class="bg-gradient-to-r from-electric-500 to-purple-500 rounded-2xl p-6 text-white">
       <h3>⏰ Weekly Review Time</h3>
       <p>15 minutes to reset and refocus</p>
       <button onclick={() => goto('/weekly-review')}>
         Start Review →
       </button>
     </div>
   {/if}
   ```

#### Part E: Session Persistence (1 hour)

**Files to Modify** (1 file):

1. **`src/routes/weekly-review/+page.svelte`** (1 hour)
   - Line 38-39: Add `savedProgress` state
   - Line 62-102: Load from localStorage on mount
   - Add $effect for auto-save (debounced 2s)

   ```typescript
   $effect(() => {
     if (step > 0) {
       const state = {
         currentStep: step,
         categorizedInbox,
         top5,
         intentions,
         savedAt: new Date(),
       };

       if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
       autoSaveTimeout = setTimeout(() => {
         localStorage.setItem("weekly_review_progress", JSON.stringify(state));
       }, 2000);
     }
   });
   ```

**Testing** (30 min):

```bash
# Manual test
- [ ] Complete Step 1 → exit → return → resumes at Step 1
- [ ] Complete Step 2 → refresh page → inbox still categorized
- [ ] "Exit (Progress Saved)" confirmation works
```

**Success Criteria**:

- ✅ Voice mode completes all 4 steps
- ✅ Sunday notification triggers
- ✅ Session persists across page refresh
- ✅ GTD score increases 40 → 46

---

### Phase 0.4: Voice Fuzzy Matching (4 hours)

#### Part A: Fuzzy Matcher Core (2 hours)

**Files to Create** (1 file):

1. **`src/lib/utils/voice-fuzzy-matcher.ts`** (2 hours)

   ```typescript
   export interface FuzzyMatchOptions {
     maxDistance: number; // Default: 3
     minScore: number; // Default: 0.6
   }

   export function fuzzyMatch(
     input: string,
     candidates: Array<{ id: string; name: string }>,
     options: FuzzyMatchOptions = {},
   ): { id: string; name: string; score: number } | null {
     // 1. Normalize
     const normalizedInput = input.toLowerCase().trim();

     // 2. Score each candidate
     const scored = candidates.map((candidate) => ({
       ...candidate,
       score: calculateSimilarity(
         normalizedInput,
         candidate.name.toLowerCase(),
       ),
     }));

     // 3. Sort by score
     scored.sort((a, b) => b.score - a.score);

     // 4. Return best match if above threshold
     const best = scored[0];
     return best && best.score >= options.minScore ? best : null;
   }

   function calculateSimilarity(str1: string, str2: string): number {
     // Token overlap (70% weight)
     const tokens1 = str1.split(/\s+/);
     const tokens2 = str2.split(/\s+/);
     const overlap = tokens1.filter((t) => tokens2.includes(t)).length;
     const tokenScore = overlap / Math.max(tokens1.length, tokens2.length);

     // Levenshtein distance (30% weight)
     const distance = levenshteinDistance(str1, str2);
     const maxLen = Math.max(str1.length, str2.length);
     const distanceScore = 1 - distance / maxLen;

     return tokenScore * 0.7 + distanceScore * 0.3;
   }

   function levenshteinDistance(str1: string, str2: string): number {
     const matrix: number[][] = [];

     for (let i = 0; i <= str2.length; i++) {
       matrix[i] = [i];
     }

     for (let j = 0; j <= str1.length; j++) {
       matrix[0][j] = j;
     }

     for (let i = 1; i <= str2.length; i++) {
       for (let j = 1; j <= str1.length; j++) {
         if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
           matrix[i][j] = matrix[i - 1][j - 1];
         } else {
           matrix[i][j] = Math.min(
             matrix[i - 1][j - 1] + 1,
             matrix[i][j - 1] + 1,
             matrix[i - 1][j] + 1,
           );
         }
       }
     }

     return matrix[str2.length][str1.length];
   }
   ```

**Testing** (30 min):

```bash
# Unit tests
- [ ] fuzzyMatch("run", [{id:1,name:"Running"}]) → score 0.8
- [ ] fuzzyMatch("call pet", [{id:1,name:"Call Peter"}]) → score 0.75
- [ ] fuzzyMatch("xyz", [{id:1,name:"Running"}]) → null (score < 0.6)
```

#### Part B: Voice Command Integration (1 hour)

**Files to Modify** (1 file):

1. **`src/lib/utils/voice-commands.ts`** (1 hour)
   - Add fuzzy handlers
   - Add unlimited batch parser

   ```typescript
   // Fuzzy task completion
   {
     regex: /^complete (.+)$/i,
     action: 'complete-task-fuzzy',
     handler: async (match, context) => {
       const result = fuzzyMatch(match[1], context.tasks);

       if (!result) {
         return {
           success: false,
           error: `No task found matching "${match[1]}"`
         };
       }

       if (result.score < 0.75) {
         return {
           success: true,
           needsConfirmation: true,
           confirmationMessage: `Did you mean "${result.name}"?`
         };
       }

       return {
         success: true,
         params: { taskId: result.id, taskName: result.name }
       };
     }
   }

   // Unlimited batch habits
   function parseBatchOperation(text: string): string[] {
     const cleaned = text
       .replace(/^mark\s+/i, '')
       .replace(/\s+(complete|done)$/i, '');

     return cleaned
       .split(/,\s*and\s*|,\s*|\s+and\s+/)
       .map(s => s.trim())
       .filter(s => s.length > 0);
   }
   ```

#### Part C: Visual Feedback Overlay (1 hour)

**Files to Create** (1 file):

1. **`src/lib/components/VoiceFeedbackOverlay.svelte`** (1 hour)

   ```svelte
   <script lang="ts">
     let { lastAction, status, message } = $props<{
       lastAction?: Action;
       status: 'listening' | 'processing' | 'success' | 'error';
       message?: string;
     }>();

     let visible = $state(false);

     $effect(() => {
       if (lastAction || message) {
         visible = true;
         setTimeout(() => { visible = false; }, 3000);
       }
     });
   </script>

   {#if visible}
     <div class="fixed bottom-4 left-4 bg-white shadow-lg rounded-lg p-4 animate-slide-in">
       {#if status === 'success'}
         <div class="flex items-center gap-2 text-green-600">
           <span class="text-2xl">✓</span>
           <span>{lastAction?.description || message}</span>
         </div>
       {:else if status === 'error'}
         <div class="flex items-center gap-2 text-red-600">
           <span class="text-2xl">✗</span>
           <span>{message}</span>
         </div>
       {/if}

       {#if lastAction}
         <p class="text-sm text-gray-500 mt-1">
           Say "undo" to reverse
         </p>
       {/if}
     </div>
   {/if}
   ```

**Testing** (30 min):

```bash
# Manual test
- [ ] Voice: "complete call pet" → suggests "Call Peter" (75% match)
- [ ] Voice: "mark running, sauna, journaling, supplements" → 4 habits
- [ ] Visual feedback shows on each action
- [ ] Auto-dismiss after 3s
```

**Success Criteria**:

- ✅ Fuzzy matching works for partial names
- ✅ Batch operations support unlimited items
- ✅ Visual feedback enhances voice UX
- ✅ Voice-First score increases to 10/10

---

## 🧪 INTEGRATION & TESTING (4 hours)

### Phase 0.5: Final Integration (4 hours)

#### Part A: Wire Components in Layout (1 hour)

**Files to Modify** (1 file):

1. **`src/routes/+layout.svelte`** (1 hour)
   - Add `VoiceFeedbackOverlay` component
   - Add `VoiceCommandExecutor` (if created)
   - Wire undo keyboard shortcut (already exists)

   ```svelte
   <script>
     import VoiceFeedbackOverlay from '$lib/components/VoiceFeedbackOverlay.svelte';
     import { actionHistory } from '$lib/stores/action-history.svelte';

     let feedbackStatus = $state<'listening' | 'processing' | 'success' | 'error'>('listening');
     let feedbackMessage = $state('');
   </script>

   <VoiceFeedbackOverlay
     lastAction={actionHistory.last}
     status={feedbackStatus}
     message={feedbackMessage}
   />
   ```

#### Part B: Driving Test (1 hour)

**Scenario**: Complete morning ritual eyes-free

```bash
# Morning ritual test (5 min, 0 screen touches)
1. Start: "start morning ritual"
2. Sleep: "slept 8 hours"
3. Energy: "feeling high energy"
4. Habits: "mark running, sauna, journaling, supplements complete"
5. Intentions: "add intention focus on weekly review today"
6. Gratitude: "grateful for family time quality sleep good health"
7. Review: "looks good"
8. Save: "save entry"

# Expected outcome:
- ✅ 0 screen touches
- ✅ 0 errors
- ✅ <5 min total time
- ✅ All fields extracted correctly
```

#### Part C: Performance Testing (30 min)

**Metrics**:

```bash
# Voice command latency
- processVoiceCommand(): Target <100ms
- fuzzyMatch(): Target <5ms
- speak(): Target <200ms (browser TTS)
- listenForResponse(): Target <10s timeout

# Component render
- ClarifyModal: Target <100ms
- VoiceFeedbackOverlay: Target <50ms
- Weekly Review page load: Target <500ms
```

#### Part D: Documentation (1.5 hours)

**Files to Create** (3 files):

1. **`PHASE-0-IMPLEMENTATION.md`** (30 min)
   - Before/after comparison
   - Expert score improvements
   - New features list
   - Migration guide

2. **`VOICE-COMMANDS-REFERENCE.md`** (30 min)
   - All 60+ voice commands
   - Organized by category
   - Examples for each
   - Fuzzy matching rules

3. **`API-ENDPOINTS.md`** (30 min)
   - All API routes
   - Request/response schemas
   - Error codes
   - Rate limits

**Testing** (30 min):

```bash
# Final checklist
- [ ] All expert scores 8+/10
- [ ] Driving test passes
- [ ] Performance metrics met
- [ ] Documentation complete
- [ ] No console errors
- [ ] TypeScript strict mode passes
```

---

## 📊 PROGRESS TRACKING

Use this checklist to track implementation:

**Phase 0.1: Audio Feedback** (2h)

- [ ] Enhance tts.ts
- [ ] Modify voice-commands.ts
- [ ] Modify ClarifyModal.svelte
- [ ] Modify TodayTab.svelte
- [ ] Test voice commands
- [ ] Test keyboard shortcuts

**Phase 0.2: Undo Integration** (30min)

- [ ] Add undo to entry save
- [ ] Add undo to weekly categorization
- [ ] Test undo via voice
- [ ] Test undo via keyboard

**Phase 0.3: Weekly Review** (6h)

- [ ] Create VoiceInboxCategorizer.svelte
- [ ] Create weekly-review-trigger.ts
- [ ] Modify service-worker.js
- [ ] Add dashboard card
- [ ] Add session persistence
- [ ] Test voice mode end-to-end
- [ ] Test notification trigger

**Phase 0.4: Voice Fuzzy** (4h)

- [ ] Create voice-fuzzy-matcher.ts
- [ ] Modify voice-commands.ts (fuzzy handlers)
- [ ] Create VoiceFeedbackOverlay.svelte
- [ ] Test fuzzy matching
- [ ] Test batch operations
- [ ] Test visual feedback

**Phase 0.5: Integration** (4h)

- [ ] Wire components in +layout.svelte
- [ ] Driving test (pass/fail)
- [ ] Performance testing
- [ ] Create documentation
- [ ] Final expert score validation

---

**Total Tasks**: 38
**Estimated Time**: 16.5 hours
**Expected Completion**: 2 days (8h/day)
