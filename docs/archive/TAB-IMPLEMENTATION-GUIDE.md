# Tab Structure Implementation Guide

**Quick Reference for Developers**

---

## Component Migration Map

### Step 1: Create New Tab Components

#### 1.1 Create `CaptureTab.svelte`

**Extract from**: `TodayTab.svelte`
**Components to move**:

```typescript
// FROM TodayTab.svelte (lines 9, 389-393, 654-656)
import VoiceRecorder from "./VoiceRecorder.svelte";
import ChatInterface from "./ChatInterface.svelte";
import ExtractionPreview from "./ExtractionPreview.svelte";

// Handlers to move
handleVoiceTranscription();
handleMessageSubmit();
handleDataChange();
```

**New structure**:

```svelte
<script lang="ts">
  import VoiceRecorder from './VoiceRecorder.svelte';
  import ChatInterface from './ChatInterface.svelte';
  import ExtractionPreview from './ExtractionPreview.svelte';

  // State (extract from TodayTab)
  let extractedData = $state<EntryFrontmatter>({});
  let isExtracting = $state(false);
  let extractionError = $state<string | null>(null);

  // Handlers (move from TodayTab)
  async function handleVoiceTranscription(text: string) { ... }
  async function handleMessageSubmit(content: string) { ... }
  function handleDataChange(data: ExtractedData) { ... }
</script>

<!-- Hero: Voice Recorder (large, centered) -->
<div class="max-w-3xl mx-auto">
  <div class="bg-white rounded-xl border border-cloud-200 p-8">
    <VoiceRecorder onTranscription={handleVoiceTranscription} />
  </div>

  <div class="text-center my-6 text-cloud-400">
    ────── OR ──────
  </div>

  <!-- Alternative: Text Input -->
  <ChatInterface
    {messages}
    onSubmit={handleMessageSubmit}
    isLoading={isExtracting}
  />

  <!-- Extraction Preview (if data exists) -->
  {#if Object.keys(extractedData).length > 0}
    <ExtractionPreview
      extraction={extractedData}
      onSave={handleSaveEntry}
      onDataChange={handleDataChange}
    />
  {/if}
</div>
```

#### 1.2 Create `TodayTab.svelte` (New Version)

**Extract from**: `TodayTab.svelte`
**Components to move**:

```typescript
// FROM TodayTab.svelte
import MorningRitual from "./MorningRitual.svelte";
import UrgentItemsSection from "./UrgentItemsSection.svelte";
import CalendarSection from "./CalendarSection.svelte";
```

**New structure**:

```svelte
<script lang="ts">
  import MorningRitual from './MorningRitual.svelte';
  import UrgentItemsSection from './UrgentItemsSection.svelte';
  import CalendarSection from './CalendarSection.svelte';

  let morningRitualComplete = $state(false);

  function handleMorningRitual(data: { grateful: string; excited: string; priorities: string[] }) {
    morningRitualComplete = true;
    // Save to extracted data
  }
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <!-- Morning Ritual (auto-collapse when complete) -->
  {#if !morningRitualComplete}
    <MorningRitual onComplete={handleMorningRitual} />
  {:else}
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
      <button onclick={() => morningRitualComplete = false}>
        ✓ Morning Ritual Complete - Tap to expand
      </button>
    </div>
  {/if}

  <!-- Top 3 Urgent Items -->
  <UrgentItemsSection />

  <!-- Today's Calendar (day view, NOT week view) -->
  <CalendarSection viewMode="day" />
</div>
```

#### 1.3 Create `HabitsTab.svelte`

**Extract from**: `TodayTab.svelte`
**Components to move**:

```typescript
// FROM TodayTab.svelte (line 11)
import HabitStreaks from "./HabitStreaks.svelte";
```

**New structure**:

```svelte
<script lang="ts">
  import HabitStreaks from './HabitStreaks.svelte';
</script>

<div class="max-w-4xl mx-auto">
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-cloud-900">Daily Habits</h2>
    <p class="text-cloud-600">Track your Blueprint habits and build consistency</p>
  </div>

  <!-- Hero: Habit Streaks (full screen) -->
  <HabitStreaks />

  <!-- TODO Phase 2: Add consistency calendar heat map -->
</div>
```

#### 1.4 Rename `CRMTab.svelte` → `PeopleTab.svelte`

```bash
mv src/lib/components/CRMTab.svelte src/lib/components/PeopleTab.svelte
```

**Update import in `+page.svelte`**:

```diff
- import CRMTab from '$lib/components/CRMTab.svelte';
+ import PeopleTab from '$lib/components/PeopleTab.svelte';
```

#### 1.5 Rename `WeeklyTab.svelte` → `PlanTab.svelte`

```bash
mv src/lib/components/WeeklyTab.svelte src/lib/components/PlanTab.svelte
```

**Update import in `+page.svelte`**:

```diff
- import WeeklyTab from '$lib/components/WeeklyTab.svelte';
+ import PlanTab from '$lib/components/PlanTab.svelte';
```

#### 1.6 Update `StrategicTab.svelte` → `InsightsTab.svelte`

```bash
mv src/lib/components/StrategicTab.svelte src/lib/components/InsightsTab.svelte
```

**Add ActivityLog component**:

```svelte
<script lang="ts">
  import ActivityLog from './ActivityLog.svelte';
  // ... existing imports
</script>

<div class="space-y-6">
  <!-- NEW: Activity Log (moved from TodayTab) -->
  <CollapsibleSection title="Activity Log" icon="📜" isOpen={true}>
    {#snippet children()}
      <ActivityLog />
    {/snippet}
  </CollapsibleSection>

  <!-- Existing sections: Metrics, Projects, Decisions, Learning, Ideas -->
</div>
```

---

## Step 2: Update Main Layout (`+page.svelte`)

### 2.1 Update Tab Type Definition

```diff
- type Tab = 'today' | 'crm' | 'weekly' | 'strategic';
+ type Tab = 'capture' | 'today' | 'habits' | 'people' | 'plan' | 'insights';
```

### 2.2 Update Tab Definitions

```typescript
const tabs: Array<{
  id: Tab;
  label: string;
  icon: string;
  shortcut: string;
  description: string;
}> = [
  {
    id: "capture",
    label: "Capture",
    icon: "🎤",
    shortcut: "⌘1",
    description: "Record thoughts via voice or text",
  },
  {
    id: "today",
    label: "Today",
    icon: "✅",
    shortcut: "⌘2",
    description: "Execute your top 3 priorities",
  },
  {
    id: "habits",
    label: "Habits",
    icon: "🔥",
    shortcut: "⌘3",
    description: "Track daily habits and streaks",
  },
  {
    id: "people",
    label: "People",
    icon: "👥",
    shortcut: "⌘4",
    description: "Manage relationships and follow-ups",
  },
  {
    id: "plan",
    label: "Plan",
    icon: "📅",
    shortcut: "⌘5",
    description: "Weekly planning and priorities",
  },
  {
    id: "insights",
    label: "Insights",
    icon: "📊",
    shortcut: "⌘6",
    description: "Metrics, projects, and patterns",
  },
];
```

### 2.3 Update Keyboard Shortcuts

```typescript
onMount(() => {
  function handleKeydown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case "1":
          e.preventDefault();
          activeTab = "capture";
          break;
        case "2":
          e.preventDefault();
          activeTab = "today";
          break;
        case "3":
          e.preventDefault();
          activeTab = "habits";
          break;
        case "4":
          e.preventDefault();
          activeTab = "people";
          break;
        case "5":
          e.preventDefault();
          activeTab = "plan";
          break;
        case "6":
          e.preventDefault();
          activeTab = "insights";
          break;
      }
    }
  }

  window.addEventListener("keydown", handleKeydown);
  return () => window.removeEventListener("keydown", handleKeydown);
});
```

### 2.4 Update Tab Content Rendering

```svelte
<main class="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
  <div class:hidden={activeTab !== 'capture'}>
    <CaptureTab />
  </div>
  <div class:hidden={activeTab !== 'today'}>
    <TodayTab />
  </div>
  <div class:hidden={activeTab !== 'habits'}>
    <HabitsTab />
  </div>
  <div class:hidden={activeTab !== 'people'}>
    <PeopleTab />
  </div>
  <div class:hidden={activeTab !== 'plan'}>
    <PlanTab />
  </div>
  <div class:hidden={activeTab !== 'insights'}>
    <InsightsTab />
  </div>
</main>
```

---

## Step 3: Update Mobile Tab Bar

### 3.1 Update `MobileTabBar.svelte`

```svelte
<script lang="ts">
  import { browser } from '$app/environment';

  type Tab = 'capture' | 'today' | 'habits' | 'people' | 'strategy';
  type StrategySubTab = 'plan' | 'insights';

  let { activeTab, onTabChange }: {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void
  } = $props();

  let strategySubTab = $state<StrategySubTab>('plan');

  const tabs = [
    { id: 'capture', icon: '🎤', label: 'Capture' },
    { id: 'today', icon: '✅', label: 'Today' },
    { id: 'habits', icon: '🔥', label: 'Habits' },
    { id: 'people', icon: '👥', label: 'People' },
    { id: 'strategy', icon: '🎯', label: 'Strategy' }
  ] as const;

  function handleTabChange(tab: Tab) {
    if (tab === 'strategy') {
      // Show segmented control for Plan vs Insights
      // Map to desktop tabs based on selection
      onTabChange(strategySubTab === 'plan' ? 'plan' : 'insights');
    } else {
      onTabChange(tab);
    }
  }
</script>

<!-- Mobile Bottom Tab Bar -->
<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-cloud-200 md:hidden z-50">
  <div class="flex justify-around items-center h-16">
    {#each tabs as tab}
      <button
        onclick={() => handleTabChange(tab.id)}
        class="flex flex-col items-center justify-center flex-1 py-2 transition-colors
               {activeTab === tab.id ? 'text-accent-500' : 'text-cloud-400'}"
      >
        <span class="text-2xl mb-1">{tab.icon}</span>
        <span class="text-xs font-medium">{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- Segmented Control for Strategy Tab (shown when active) -->
  {#if activeTab === 'strategy'}
    <div class="flex gap-2 px-4 pb-2">
      <button
        onclick={() => { strategySubTab = 'plan'; onTabChange('plan'); }}
        class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors
               {strategySubTab === 'plan' ? 'bg-accent-500 text-white' : 'bg-cloud-100 text-cloud-600'}"
      >
        Plan
      </button>
      <button
        onclick={() => { strategySubTab = 'insights'; onTabChange('insights'); }}
        class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors
               {strategySubTab === 'insights' ? 'bg-accent-500 text-white' : 'bg-cloud-100 text-cloud-600'}"
      >
        Insights
      </button>
    </div>
  {/if}
</nav>
```

---

## Step 4: Update Brand Configuration

### 4.1 Update `src/lib/brand/index.ts`

```diff
  copy: {
    tabs: {
-     today: {
-       label: "Daily AI",
-       description: "Your AI partner for today's priorities",
-     },
-     crm: {
-       label: "People Intelligence",
-       description: "AI tracks every relationship automatically",
-     },
-     weekly: {
-       label: "Weekly Strategy",
-       description: "AI-guided planning & priorities",
-     },
-     strategic: {
-       label: "Strategic AI",
-       description: "Long-term intelligence & insights",
-     },
+     capture: {
+       label: "Capture",
+       description: "Record thoughts via voice or text",
+     },
+     today: {
+       label: "Today",
+       description: "Execute your top 3 priorities",
+     },
+     habits: {
+       label: "Habits",
+       description: "Track daily habits and streaks",
+     },
+     people: {
+       label: "People",
+       description: "Manage relationships and follow-ups",
+     },
+     plan: {
+       label: "Plan",
+       description: "Weekly planning and priorities",
+     },
+     insights: {
+       label: "Insights",
+       description: "Metrics, projects, and patterns",
+     },
    },
  },
```

---

## Step 5: Update CalendarSection for Day View

### 5.1 Add `viewMode` prop to `CalendarSection.svelte`

```diff
  <script lang="ts">
+   let { viewMode = 'week' }: { viewMode?: 'day' | 'week' } = $props();

    // ... existing code
  </script>

+ {#if viewMode === 'day'}
+   <!-- Day View: Only show today's column -->
+   <div class="calendar-day">
+     <CalendarDayColumn date={today} events={todayEvents} />
+   </div>
+ {:else}
    <!-- Week View: Show all 7 days -->
    <div class="calendar-week">
      {#each weekDays as day}
        <CalendarDayColumn date={day} events={getEventsForDay(day)} />
      {/each}
    </div>
+ {/if}
```

---

## Step 6: Testing Checklist

### 6.1 Desktop Testing (Chrome, Safari, Firefox)

```bash
pnpm dev
```

- [ ] All 6 tabs visible in navigation
- [ ] Keyboard shortcuts work (⌘1-6)
- [ ] Capture tab: Voice recorder is hero element
- [ ] Today tab: Morning ritual auto-collapses
- [ ] Habits tab: Streaks visible without scrolling
- [ ] People tab: Follow-up alerts show red badges
- [ ] Plan tab: Warren Buffett 25/5 works
- [ ] Insights tab: Activity log at top

### 6.2 Mobile Testing (iOS Safari, Android Chrome)

```bash
# Use ngrok or deploy to Vercel for mobile testing
pnpm build && pnpm preview
```

- [ ] 5 tabs visible in bottom bar
- [ ] Strategy tab shows segmented control (Plan | Insights)
- [ ] Touch targets are 44×44pt minimum
- [ ] Voice button is 64×64pt (hero size)
- [ ] Tab transitions are smooth
- [ ] No horizontal scrolling

### 6.3 GTD Flow Testing

```
Test: Capture → Clarify → Organize → Reflect → Engage

1. Go to Capture tab (⌘1)
2. Record voice: "Call Leon tomorrow about partnership"
3. Review extraction (AI should extract person + task)
4. Save
5. Go to Plan tab (⌘5)
6. Add to weekly priorities
7. Go to Insights tab (⌘6)
8. Check activity log (should show capture event)
9. Go to Today tab (⌘2)
10. See task in urgent items
```

**Expected Result**: Task flows through all GTD phases in correct order.

### 6.4 Atomic Habits Testing

```
Test: Make it Obvious → Attractive → Easy → Satisfying

1. Go to Habits tab (⌘3)
2. See all habit streaks prominently (Obvious)
3. Toggle "Running" habit
4. See confetti animation (Attractive + Satisfying)
5. See streak increment immediately (Easy)
6. See progress toward next milestone (Satisfying)
```

**Expected Result**: Habit tracking feels rewarding and frictionless.

---

## Step 7: Rollout Plan

### 7.1 Phase 1: Backend Prep (30 min)

- [ ] Create new tab components (files only, no content)
- [ ] Update type definitions in `+page.svelte`
- [ ] Test that app still compiles

### 7.2 Phase 2: Component Migration (2 hours)

- [ ] Move VoiceRecorder + ChatInterface to CaptureTab
- [ ] Move MorningRitual + UrgentItems to new TodayTab
- [ ] Move HabitStreaks to HabitsTab
- [ ] Rename CRM/Weekly/Strategic tabs
- [ ] Update InsightsTab with ActivityLog

### 7.3 Phase 3: Navigation Update (1 hour)

- [ ] Update tab definitions
- [ ] Update keyboard shortcuts
- [ ] Update mobile tab bar
- [ ] Update brand copy

### 7.4 Phase 4: Testing & Polish (2 hours)

- [ ] Test GTD flow
- [ ] Test Atomic Habits flow
- [ ] Test mobile responsive
- [ ] Fix any bugs
- [ ] Add transition animations

### 7.5 Phase 5: Deploy (30 min)

- [ ] Create feature branch: `feature/6-tab-structure`
- [ ] Commit changes
- [ ] Deploy to Vercel preview
- [ ] Test on real devices
- [ ] Merge to main

**Total Time**: 5-6 hours

---

## Troubleshooting

### Issue: "Component not found after rename"

```bash
# Make sure to update ALL imports
grep -r "CRMTab" src/
grep -r "WeeklyTab" src/
grep -r "StrategicTab" src/
```

### Issue: "Mobile tab bar shows 6 tabs instead of 5"

```typescript
// Check MobileTabBar.svelte has 'strategy' tab, not 'plan' and 'insights' separately
const tabs = [
  { id: 'capture', ... },
  { id: 'today', ... },
  { id: 'habits', ... },
  { id: 'people', ... },
  { id: 'strategy', ... } // NOT 'plan' and 'insights'
];
```

### Issue: "Keyboard shortcuts not working"

```typescript
// Make sure onMount is in +page.svelte, not in tab components
onMount(() => {
  function handleKeydown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey) {
      // Shortcuts here
    }
  }
  window.addEventListener("keydown", handleKeydown);
  return () => window.removeEventListener("keydown", handleKeydown);
});
```

---

## File Changes Summary

### New Files

```
src/lib/components/CaptureTab.svelte
src/lib/components/HabitsTab.svelte
```

### Renamed Files

```
src/lib/components/CRMTab.svelte → PeopleTab.svelte
src/lib/components/WeeklyTab.svelte → PlanTab.svelte
src/lib/components/StrategicTab.svelte → InsightsTab.svelte
```

### Updated Files

```
src/routes/+page.svelte (tab definitions, navigation)
src/lib/components/TodayTab.svelte (slimmed down)
src/lib/components/MobileTabBar.svelte (5-tab mobile layout)
src/lib/components/CalendarSection.svelte (add day view mode)
src/lib/brand/index.ts (update tab copy)
```

---

## Git Commit Strategy

```bash
# Commit 1: Create new files
git add src/lib/components/CaptureTab.svelte
git add src/lib/components/HabitsTab.svelte
git commit -m "feat: Add CaptureTab and HabitsTab components"

# Commit 2: Rename existing files
git mv src/lib/components/CRMTab.svelte src/lib/components/PeopleTab.svelte
git mv src/lib/components/WeeklyTab.svelte src/lib/components/PlanTab.svelte
git mv src/lib/components/StrategicTab.svelte src/lib/components/InsightsTab.svelte
git commit -m "refactor: Rename CRM/Weekly/Strategic tabs to People/Plan/Insights"

# Commit 3: Update navigation
git add src/routes/+page.svelte
git add src/lib/components/MobileTabBar.svelte
git commit -m "feat: Implement 6-tab structure (5 on mobile)"

# Commit 4: Update brand copy
git add src/lib/brand/index.ts
git commit -m "docs: Update brand copy for new tab structure"

# Commit 5: Final polish
git add .
git commit -m "polish: Add transitions and accessibility improvements"
```

---

**Document Version**: 1.0
**Date**: 2026-02-16
**Companion to**: TAB-STRUCTURE-DESIGN.md, TAB-STRUCTURE-VISUAL.md
