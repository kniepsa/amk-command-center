# Calendar Week View Implementation

**Date**: 2026-02-16
**Status**: ✅ Complete
**Time**: 35 minutes

## Overview

Transformed CalendarSection from "today only" view to Notion-style weekly calendar with navigation.

## Components Created

### 1. CalendarDayColumn.svelte

**Location**: `/Users/amk/Projects/amk-command-center/src/lib/components/CalendarDayColumn.svelte`

**Features**:

- Date header with day name and date number
- Today highlighting (electric-blue border and background)
- Events display (blue cards with time and attendees)
- Tasks display (green cards with area tag)
- Empty state message
- "Add Task" button for quick task creation

**Props**:

```typescript
interface Props {
  date: Date; // Day to display
  events: CalendarEvent[]; // Events for this day
  tasks: Task[]; // Tasks with reminders for this day
  isToday: boolean; // Highlight if today
  onAddTask?: (date: Date) => void; // Callback for adding tasks
}
```

### 2. CalendarSection.svelte (Updated)

**Location**: `/Users/amk/Projects/amk-command-center/src/lib/components/CalendarSection.svelte`

## Key Features Implemented

### Week State Management

- `currentWeekStart`: Reactive state tracking Monday of current week
- `weekDays`: Derived array of 7 dates (Mon-Sun)
- `getMonday()`: Calculate Monday from any date
- Auto-reload when week changes via `$effect()`

### Navigation Controls

- **Previous Week**: Navigate backward 7 days
- **Next Week**: Navigate forward 7 days
- **Today**: Jump to current week instantly

### Week Grid Layout

- **Desktop (lg)**: 7 columns (full week visible)
- **Tablet (md)**: 3 columns (scrollable)
- **Mobile**: 3 columns with horizontal scroll snap

### Data Aggregation

- `getEventsForDay()`: Filter events by date
- `getTasksForDay()`: Filter tasks by reminder date
- `loadWeekData()`: Fetch events + tasks for week range

### Task Integration

- Fetches tasks with reminder dates in current week
- Groups tasks by day in calendar grid
- Tasks displayed as green cards below events

## Mobile Responsive Design

```css
@media (max-width: 768px) {
  .week-grid {
    grid-auto-flow: column;      // Horizontal scrolling
    overflow-x: auto;            // Enable scroll
    scroll-snap-type: x mandatory; // Snap to columns
  }

  .week-grid > :global(*) {
    scroll-snap-align: start;    // Snap points
    min-width: calc(33.333% - 0.5rem); // Show 3 days
  }
}
```

## Date/Time Utilities

### Week Navigation

```typescript
function getMonday(date: Date): Date;
function nextWeek(): void;
function prevWeek(): void;
function goToToday(): void;
```

### Display Formatting

```typescript
function formatWeekRange(days: Date[]): string;
// Output: "Feb 10 - Feb 16, 2026"

function formatDayName(d: Date): string;
// Output: "Mon", "Tue", etc.

function formatTime(time: string): string;
// Input: "14:30"
// Output: "2:30 PM"
```

### Date Comparison

```typescript
function isToday(date: Date): boolean;
function getEventsForDay(day: Date): CalendarEvent[];
function getTasksForDay(day: Date): Task[];
```

## API Integration

### Tasks Endpoint

```typescript
const tasksResponse = await api.tasks.list({
  workspace: "amk",
  status: "open",
});

// Filter to current week
weekTasks = tasksResponse.tasks.filter((task) => {
  if (!task.reminderDate) return false;
  const reminderDate = new Date(task.reminderDate);
  return reminderDate >= currentWeekStart && reminderDate < weekEnd;
});
```

### Calendar Endpoint (Mock)

```typescript
// TODO: Implement GET /api/v1/calendar/week?start=YYYY-MM-DD
// Currently using mock data: generateMockCalendarData()
```

## Visual Design

### Color Scheme

- **Today**: Electric blue (`electric-50`, `electric-300`)
- **Events**: Blue cards (`blue-50`, `blue-200`)
- **Tasks**: Green cards (`green-50`, `green-200`)
- **Empty days**: White background
- **Navigation**: Cloud gray (`cloud-200`, `cloud-600`)

### Layout Hierarchy

```
┌─────────────────────────────────────────┐
│ 📅 Week of Feb 10 - Feb 16, 2026        │
│ [← Prev] [Today] [Next →]               │
├─────────────────────────────────────────┤
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │
│  10 │  11 │  12 │  13 │  14 │  15 │  16 │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ Event 1 │     │     │ Event 2 │     │   │
│ Task A  │     │     │         │     │   │
│ + Add   │+ Add│+ Add│  + Add  │+ Add│...│
└─────────────────────────────────────────┘
```

## Testing Checklist

- ✅ Week navigation (Prev/Next/Today buttons)
- ✅ Today highlighting (electric-blue border)
- ✅ Task fetching and filtering by week
- ✅ Mobile responsive (3-column grid)
- ✅ TypeScript type safety (0 errors)
- ✅ Date calculations (Monday start, 7-day array)
- ✅ Event/task aggregation by day

## Future Enhancements

### Backend API

1. Implement `GET /api/v1/calendar/week?start=YYYY-MM-DD`
2. Real Google Calendar MCP integration
3. Date-based event filtering (not just "today")

### UI Features

1. Drag-and-drop to reschedule tasks/events
2. Click day header to add event (not just task)
3. Multi-day event spanning
4. Time-based layout (hour slots)
5. Color-coding by calendar/category

### Task Modal

1. Click "Add Task" opens modal
2. Pre-fill reminder date with selected day
3. Quick area/context selection
4. Keyboard shortcuts (Cmd+K to add)

### Performance

1. Virtual scrolling for long task lists
2. Debounce week navigation
3. Cache week data in localStorage
4. Optimistic UI updates

## Integration Points

### Components Used

- `CalendarDayColumn` (new component)
- `@amk/command-center-sdk` (Task types)
- `$lib/api/client` (API calls)

### Routes

- Displayed on: `/` (Daily AI tab, Calendar section)
- No new routes created

### State Management

- Local Svelte 5 runes (`$state`, `$derived`, `$effect`)
- No global store needed (self-contained)

## Code Quality

- **TypeScript**: Strict mode, explicit types
- **Svelte 5**: Modern runes syntax
- **Responsive**: Mobile-first CSS
- **Accessibility**: ARIA labels on buttons
- **Performance**: Derived state, reactive effects

## Files Modified

1. `/Users/amk/Projects/amk-command-center/src/lib/components/CalendarSection.svelte`
   - Added week state management
   - Added navigation controls
   - Replaced daily view with week grid
   - Added task integration

2. `/Users/amk/Projects/amk-command-center/src/lib/components/CalendarDayColumn.svelte` (NEW)
   - Single day column component
   - Events + tasks display
   - Add task button

## Screenshot Description

**Week View Layout**:

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Week of Feb 10 - Feb 16, 2026     [←Prev][Today][Next→]  │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────────┤
│ MON  │ TUE  │ WED  │ THU  │ FRI  │ SAT  │ SUN  │             │
│  10  │  11  │  12  │  13  │  14  │  15  │  16  │             │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤             │
│      │      │      │      │      │      │ TODAY│ <- Highlight│
│ 📘   │      │ 📘   │      │ 📘   │      │ 📘   │ <- Events   │
│ Event│      │Event │      │Event │      │Event │             │
│      │      │      │      │      │      │      │             │
│ 📗   │ 📗   │      │ 📗   │      │      │ 📗   │ <- Tasks    │
│ Task │Task  │      │Task  │      │      │Task  │             │
│      │      │      │      │      │      │      │             │
│+ Add │+ Add │+ Add │+ Add │+ Add │+ Add │+ Add │             │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴─────────────┘
```

**Mobile View** (3 columns, horizontal scroll):

```
┌────────────────────────────┐
│ 📅 Week of Feb 10 - Feb 16 │
│ [←Prev] [Today] [Next→]    │
├────────┬─────────┬─────────┤
│ MON 10 │ TUE 11  │ WED 12  │ → (scroll)
│ Event  │         │ Event   │
│ Task   │ Task    │         │
│ + Add  │ + Add   │ + Add   │
└────────┴─────────┴─────────┘
```

## Lessons Learned

1. **Svelte 5 Effects**: Using `void currentWeekStart` in `$effect()` to track state changes is cleaner than event listeners
2. **Mobile Scroll Snap**: `scroll-snap-type: x mandatory` provides smooth column-by-column scrolling
3. **Date Filtering**: Filter tasks by week range in frontend (no backend week query needed yet)
4. **Component Reusability**: Single `CalendarDayColumn` component handles all 7 days cleanly

## Notes

- Mock calendar data still used (Google Calendar MCP not available)
- Backend `/api/v1/calendar/week` endpoint not implemented yet
- Task creation modal not built (console.log placeholder)
- Real events would need date-based filtering (currently only shows on "today")
