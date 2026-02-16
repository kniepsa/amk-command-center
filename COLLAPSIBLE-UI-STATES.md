# Collapsible Sections - UI States

## Daily AI Section

### Expanded (Incomplete)
```
┌─────────────────────────────────────────┐
│ Daily AI                                │
├─────────────────────────────────────────┤
│                                         │
│ [Morning Ritual Form]                   │
│ - What are you grateful for?            │
│ - What are you excited about?           │
│ - Today's priorities (3)                │
│                                         │
│ [Habit Streaks]                         │
│ ☑️ Running: 5 days                      │
│ ☑️ Journaling: 12 days                  │
│                                         │
└─────────────────────────────────────────┘
```

### Expanded (Complete - with collapse option)
```
┌─────────────────────────────────────────┐
│ Daily AI                    ✓ Collapse  │
├─────────────────────────────────────────┤
│                                         │
│ [Morning Ritual - Completed]            │
│ ✓ Grateful: Family health               │
│ ✓ Excited: Leon meeting                 │
│ ✓ Priorities: 3 set                     │
│                                         │
│ [Habit Streaks]                         │
│ ☑️ Running: 5 days                      │
│ ☑️ Journaling: 12 days                  │
│                                         │
└─────────────────────────────────────────┘
```

### Collapsed (Complete)
```
╔═════════════════════════════════════════╗
║ ✓  Daily AI Complete              Expand→║
║    Energy logged, intentions set,       ║
║    gratitude captured                   ║
╚═════════════════════════════════════════╝
```

## Sales Learning Section

### Expanded (Active Lesson)
```
┌─────────────────────────────────────────┐
│ 💼 Sales Learning - Day 15/30           │
│ Progress: ████████░░░░░░░░ 50%          │
├─────────────────────────────────────────┤
│ Today's Framework: SPIN Selling         │
│                                         │
│ [Lesson Content]                        │
│ Situation → Problem → Implication →     │
│ Need-Payoff                             │
│                                         │
│ ✓ Key Takeaways                         │
│ • Ask open questions                    │
│ • Listen 80/20                          │
│                                         │
│ 📝 Practice Exercise                    │
│ Role-play discovery call with Leon     │
│                                         │
│ Next: Day 16 - Objection Handling      │
│           [Mark Complete & Continue]    │
└─────────────────────────────────────────┘
```

### Expanded (Complete - with collapse option)
```
┌─────────────────────────────────────────┐
│ Sales Learning              ✓ Collapse  │
│ 💼 Sales - Day 15/30                    │
├─────────────────────────────────────────┤
│ Today's Framework: SPIN Selling         │
│                                         │
│ [Lesson Content - Same as above]        │
│                                         │
│ ✓ COMPLETED                             │
│                                         │
└─────────────────────────────────────────┘
```

### Collapsed (Complete)
```
╔═════════════════════════════════════════╗
║ ✓  Sales Learning - Day 15 Complete    ║
║    SPIN Selling                    Expand→║
╚═════════════════════════════════════════╝
```

## Visual Styling

### Collapsed Card
- **Background**: `#f0f9ff` (light blue)
- **Border**: `1px dashed #3b82f6` (blue)
- **Border Radius**: `0.5rem`
- **Padding**: `1rem`
- **Hover Background**: `#e0f2fe` (darker blue)
- **Hover Border**: `#2563eb` (darker blue)
- **Transition**: `all 0.2s ease`

### Checkmark Icon
- **Size**: `2xl` (text-2xl)
- **Color**: Green/Success color
- **Position**: Left side of text

### Expand Button
- **Text**: "Expand →"
- **Color**: `#9ca3af` (cloud-400)
- **Hover**: Darker shade
- **Position**: Right side

## Interaction Flow

### Auto-Collapse (Daily AI)
1. User fills energy level → no collapse
2. User adds 1st intention → no collapse
3. User adds 1st gratitude → **AUTO-COLLAPSE**
4. UI smoothly transitions to collapsed card
5. localStorage saves `dailyAIExpanded = false`

### Auto-Collapse (Learning)
1. User reads lesson content
2. User clicks "Mark Complete & Continue"
3. **AUTO-COLLAPSE** immediately
4. localStorage saves:
   - `learningExpanded = false`
   - `lesson-complete-sales-day-15 = true`
5. Next day: new lesson, expanded by default

### Manual Expand
1. User clicks anywhere on collapsed card
2. Card smoothly expands to full size
3. All content visible again
4. Collapse button appears in header
5. localStorage saves `[section]Expanded = true`

### Manual Collapse
1. User clicks "✓ Collapse" button in expanded header
2. Card smoothly collapses
3. localStorage saves `[section]Expanded = false`

## Responsive Behavior

### Desktop (> 768px)
- Full width cards
- Hover states active
- Smooth transitions

### Mobile (< 768px)
- Full width cards (same as desktop)
- Touch-friendly button sizes (min 44px height)
- No hover states (tap to expand)

## Accessibility

- Clickable area = entire collapsed card (large touch target)
- Semantic HTML: `<button>` for interactive elements
- Clear visual indicators (checkmarks, text)
- Color contrast meets WCAG AA standards
- Keyboard navigation supported (tab to button, enter to toggle)
- Screen reader announces: "Daily AI Complete, expand button"

## Edge Cases Handled

1. **Page refresh**: State restored from localStorage
2. **Multiple tabs**: Each tab has independent state (localStorage shared)
3. **New day**: Learning section resets (new lesson), Daily AI resets (new day)
4. **No localStorage**: Defaults to expanded (graceful degradation)
5. **Partial completion**: Sections stay expanded until ALL criteria met

## Performance

- No re-renders on unrelated state changes (derived state)
- localStorage writes debounced via Svelte $effect
- Smooth 60fps animations (CSS transitions)
- No layout shift (collapsed/expanded same width)
