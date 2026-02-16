# Toast Visual Guide

## Toast Types

### 1. Success Toast (Green)

```
┌─────────────────────────────────────────────┐
│ ✓  Day planned! ✨ Grateful for "family",  │ ×
│    Priority: Close M&A deals                │
└─────────────────────────────────────────────┘
   ↑                                          ↑
 Icon                                    Dismiss

Color: bg-green-500 (#10b981)
Duration: 3 seconds
Use: Action completed successfully
```

### 2. Error Toast (Red)

```
┌─────────────────────────────────────────────┐
│ ✗  Save failed: Network error. Check your  │ ×
│    internet and retry.                      │
└─────────────────────────────────────────────┘

Color: bg-red-500 (#ef4444)
Duration: 5 seconds (longer for errors)
Use: Action failed with recovery guidance
```

### 3. Info Toast (Blue)

```
┌─────────────────────────────────────────────┐
│ ℹ  Tip: Use voice commands for faster       │ ×
│    entry logging                            │
└─────────────────────────────────────────────┘

Color: bg-blue-500 (#3b82f6)
Duration: 3 seconds
Use: Helpful tips and information
```

### 4. Warning Toast (Yellow)

```
┌─────────────────────────────────────────────┐
│ ⚠  You have 2 overdue tasks. Review your    │ ×
│    urgent list.                             │
└─────────────────────────────────────────────┘

Color: bg-yellow-500 (#f59e0b)
Duration: 4 seconds
Use: Non-critical warnings
```

## Toast Stack (Multiple Toasts)

```
                                    ┌─────────────────────┐
                                    │ ✓  Task completed!  │ ×
                                    └─────────────────────┘
                                           ↑ Newest (top)

                                    ┌─────────────────────┐
                                    │ ✓  Entry saved! ✨  │ ×
                                    └─────────────────────┘

                                    ┌─────────────────────┐
                                    │ ✓  Week planned 🎯  │ ×
                                    └─────────────────────┘
                                           ↓ Oldest (bottom)
```

## Animation

### Desktop (Right Slide-In)

```
[Off-screen right] ──→ [Visible]
       0ms              300ms
     Opacity: 0       Opacity: 1
```

### Mobile (Full Width)

```
┌───────────────────────────────────────────┐
│ ✓  Nice! ✨ Task completed. Undo? ×       │
└───────────────────────────────────────────┘
  ↑ Full width on screens < 640px
```

## Auto-Save Indicator

### States

#### Saving

```
┌─────────────────────┐
│ ◌  Saving...        │
└─────────────────────┘
  ↑ Animated spinner
```

#### Saved

```
┌─────────────────────┐
│ ✓  Saved 2m ago     │
└─────────────────────┘
```

#### Error

```
┌──────────────────────────────┐
│ ✗  Error saving  [Retry]     │
└──────────────────────────────┘
                      ↑ Button
```

## Real-World Examples

### Morning Ritual Completion

```
User clicks: "Start Day ⚡"

Toast appears:
┌─────────────────────────────────────────────┐
│ ✓  Day planned! ✨ Grateful for "family",  │ ×
│    Priority: Close M&A deals                │
└─────────────────────────────────────────────┘

Auto-dismisses after 3 seconds
```

### Task Status Change

```
User clicks: Checkbox on task

Toast appears:
┌─────────────────────────────────────────────┐
│ ✓  Nice! ✨ "Call Leon about partnership"  │ ×
│    is done. Say "undo" to reverse.          │
└─────────────────────────────────────────────┘
```

### Weekly Planning Save

```
User clicks: "Save Plan"

Toast appears:
┌─────────────────────────────────────────────┐
│ ✓  Your week is focused! 🎯 5 priorities   │ ×
│    locked in.                               │
└─────────────────────────────────────────────┘
```

### Network Error

```
User saves entry while offline

Toast appears:
┌─────────────────────────────────────────────┐
│ ✗  Save failed: Network error. Check your  │ ×
│    internet and retry.                      │
└─────────────────────────────────────────────┘

Stays for 5 seconds (longer for errors)
```

## Positioning

### Desktop (>640px)

```
┌─────────────────────────────────────────────────────┐
│                                          [Toast 1]  │
│                                          [Toast 2]  │
│                                          [Toast 3]  │
│                                                     │
└─────────────────────────────────────────────────────┘
                                             ↑
                              top: 5rem, right: 1.5rem
```

### Mobile (<640px)

```
┌─────────────────────────────────────────────────────┐
│  [Toast 1 - Full Width]                             │
│  [Toast 2 - Full Width]                             │
│  [Toast 3 - Full Width]                             │
│                                                      │
└──────────────────────────────────────────────────────┘
   ↑
top: 4rem, left: 1rem, right: 1rem
```

## Personality Examples

### Warm Success Messages

- ✨ "Day planned!" (not "Plan saved")
- 🎯 "Your week is focused!" (not "Priorities saved")
- ✨ "Nice!" (not "Success")
- ⏸️ "Task paused" (not "Status updated")

### Clear Error Messages

- "Network error. Check internet and retry." (not "ERR_NETWORK")
- "Search failed: Invalid query" (not "Error 400")
- "Failed to save. Refresh and try again." (not "Save error")

## Accessibility

### Screen Reader Announcements

```html
<div role="alert" aria-live="polite">Success! Entry saved.</div>
```

### Keyboard Navigation (Future)

- Escape: Dismiss all toasts
- Tab: Focus close button
- Enter/Space: Dismiss focused toast

## Color Palette

```
Success:  #10b981  (Tailwind green-500)
Error:    #ef4444  (Tailwind red-500)
Info:     #3b82f6  (Tailwind blue-500)
Warning:  #f59e0b  (Tailwind yellow-500)
Text:     #ffffff  (White)
Border:   Darker shade of background
```

## Technical Specs

- **Z-Index:** 60 (above modals at 50, below tooltips at 70)
- **Max Width:** 400px (desktop)
- **Border Radius:** 0.75rem (12px)
- **Padding:** 1rem 1.25rem
- **Font Size:** 0.875rem (14px)
- **Line Height:** 1.4
- **Shadow:** 0 10px 25px rgba(0,0,0,0.2)
- **Animation:** cubic-bezier(0.16, 1, 0.3, 1) 300ms

## Integration Code Example

```typescript
// In any component
import { toast } from "$lib/stores/toast.svelte";

async function handleSave() {
  try {
    await api.save();
    toast.success("Saved! ✨");
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed: ${msg}`);
  }
}
```

## Testing Quick Reference

1. Open browser devtools
2. Console: `toast.success('Test! ✨')`
3. Verify: Green toast appears top-right
4. Wait 3 seconds → Auto-dismisses
5. Click X → Immediate dismiss
