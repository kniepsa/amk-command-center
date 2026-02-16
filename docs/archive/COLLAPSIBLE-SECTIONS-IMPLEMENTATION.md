# Collapsible Sections Implementation

**Date**: 2026-02-15
**Feature**: Smart auto-collapsing sections for Daily AI and Sales Learning

## Overview

Implemented collapsible sections on the Command Center home page (Today tab) that automatically collapse when completed and can be expanded again on demand.

## Implementation Details

### 1. Daily AI Section (`TodayTab.svelte`)

**Auto-collapse triggers**:

- Energy level logged
- At least 1 intention set
- At least 1 gratitude entry captured

**Features**:

- Auto-collapses when all fields complete
- Shows "✓ Daily AI Complete" collapsed state
- Displays summary: "Energy logged, intentions set, gratitude captured"
- Expand button to restore full view
- State persisted to localStorage (`dailyAIExpanded`)

**Code location**: `/Users/amk/Projects/amk-command-center/src/lib/components/TodayTab.svelte`

### 2. Sales Learning Section (`LearningSession.svelte`)

**Auto-collapse triggers**:

- User clicks "Mark Complete & Continue" button
- Completion state saved to localStorage per day/course

**Features**:

- Auto-collapses when day's lesson marked complete
- Shows "✓ [Course Name] - Day X Complete" with lesson title
- Expand button to review completed lesson
- State persisted to localStorage (`learningExpanded` + per-lesson completion)

**Code locations**:

- `/Users/amk/Projects/amk-command-center/src/lib/components/LearningSession.svelte`
- `/Users/amk/Projects/amk-command-center/src/lib/components/ChatInterface.svelte`

## User Experience

### Before Completion

- Both sections fully expanded
- User can interact with all controls
- Normal workflow

### After Completion

- Section auto-collapses with success indicator (✓)
- Minimal collapsed card shows:
  - Green checkmark
  - Section name + completion summary
  - "Expand →" button
- User can click anywhere on card to re-expand
- Collapse button appears in expanded header to manually collapse

### Visual Design

- Collapsed state: Light blue background (`#f0f9ff`)
- Dashed blue border (`#3b82f6`)
- Hover effect: Darker blue background
- Smooth transitions (0.3s ease)
- Consistent with existing Command Center design

## State Persistence

### localStorage Keys

1. `dailyAIExpanded`: boolean (true/false)
2. `learningExpanded`: boolean (true/false)
3. `lesson-complete-{courseId}-day-{dayNumber}`: boolean (per lesson)

### Behavior

- State loads on component mount
- State saves on toggle
- Auto-collapse saves immediately when conditions met
- Persists across browser sessions

## Progressive Disclosure Principle

Follows Joe Gebbia's UX framework:

1. **Essential first**: Show incomplete sections
2. **Friction-aware**: Minimize decisions (auto-collapse)
3. **Trust through transparency**: Clear completion indicators
4. **Seamless**: Smooth transitions, persistent state

## Technical Details

### Props Interface (`LearningSession.svelte`)

```typescript
interface Props {
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}
```

### Derived State (`TodayTab.svelte`)

```typescript
let dailyAIComplete = $derived(
  extractedData.energy &&
    extractedData.intentions?.length > 0 &&
    extractedData.gratitude?.length >= 1,
);
```

### Effects

- Load saved state from localStorage on mount
- Auto-collapse when completion detected
- Persist state changes to localStorage

## Files Modified

1. `/Users/amk/Projects/amk-command-center/src/lib/components/TodayTab.svelte`
   - Added collapsible Daily AI section
   - Added state management and localStorage persistence
   - Added styles for collapsed sections

2. `/Users/amk/Projects/amk-command-center/src/lib/components/LearningSession.svelte`
   - Added props interface for expanded state and toggle callback
   - Added lesson completion tracking
   - Added collapsible wrapper UI
   - Added styles for collapsed state

3. `/Users/amk/Projects/amk-command-center/src/lib/components/ChatInterface.svelte`
   - Added learning expansion state management
   - Added localStorage persistence for learning section
   - Passed expanded state and toggle handler to LearningSession component

## Testing

✅ Build successful (no errors)
✅ TypeScript types correct
✅ Svelte warnings minimal (only existing accessibility warnings)
✅ State management isolated to components

## Next Steps (Future Enhancements)

1. Add animation for collapse/expand (slide transition)
2. Add keyboard shortcuts (e.g., Ctrl+D to toggle Daily AI)
3. Add "Reset Progress" button for lessons
4. Track completion metrics in backend
5. Add celebration animation on first completion
6. Consider collapsible Coach Challenges section

## Gotchas

- localStorage state must be checked for `null` before parsing
- Auto-collapse should only trigger ONCE when complete (not on every state change)
- Learning section is nested in ChatInterface, requires prop drilling
- Completion state persists across days - reset logic needed for new day

## User Feedback Expected

- Positive: "Page feels less cluttered after I finish my morning routine"
- Positive: "Love that I can still expand to review what I logged"
- Possible: "Want keyboard shortcut to toggle sections"
- Possible: "Add 'mark incomplete' button to reset Daily AI"
