# Quick Start Guide for Agent 1 (Frontend Developer)

**TL;DR**: Two API endpoints are ready. Build the chat UI and consume them.

---

## What's Ready for You

- ✅ POST `/api/extract-entry` - Extract structured data from voice transcripts
- ✅ GET `/api/weekly/current` - Get current week's priorities
- ✅ TypeScript types in `src/lib/types.ts`
- ✅ Mock data for development (no Claude API needed yet)
- ✅ Complete documentation in `API-CONTRACTS.md`

---

## 5-Minute Integration Guide

### 1. Test APIs Are Working

```bash
# Start dev server
npm run dev

# In another terminal, run tests
./tests/api-test.sh
```

You should see green checkmarks for all tests.

### 2. Import Types

```typescript
// In your TodayTab.svelte or similar
import type { ExtractEntryResponse, CurrentWeekResponse } from "$lib/types";
```

### 3. Call Extract Entry API

```typescript
async function extractFromText(text: string) {
  const response = await fetch("/api/extract-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: new Date().toISOString().split("T")[0], // "2026-02-11"
      text: text,
    }),
  });

  if (!response.ok) {
    throw new Error("Extraction failed");
  }

  const data: ExtractEntryResponse = await response.json();
  return data;
}
```

### 4. Call Weekly Current API

```typescript
async function loadWeeklyPriorities() {
  const response = await fetch("/api/weekly/current");
  const data: CurrentWeekResponse = await response.json();
  return data.priorities;
}
```

### 5. Display Extracted Data

```typescript
// After extraction
const { extracted, confidence, suggestions } = await extractFromText(userInput);

// Show in sidebar:
// - Sleep: { bedtime, wake_time, duration, quality }
// - Energy: "high" | "medium" | "low" | "drained"
// - Habits: { running: true, sauna: false, ... }
// - Intentions: ["Close Leon deal", ...]
// - Gratitude: [{ thing: "Jani", why: "..." }]
// - Food: [{ time: "12:00", meal: "Joghurt", portion_grams: [300] }]

// Warn if confidence < 0.7
if (confidence < 0.7) {
  showWarning("Low confidence extraction, please review");
}

// Show suggestions
if (suggestions?.length > 0) {
  showSuggestions(suggestions);
}
```

---

## Example: Complete Integration

```svelte
<script lang="ts">
  import type { ExtractEntryResponse, WeeklyPriority } from '$lib/types';
  import { onMount } from 'svelte';

  let userInput = $state('');
  let extracted = $state<ExtractEntryResponse['extracted']>({});
  let confidence = $state(0);
  let suggestions = $state<string[]>([]);
  let weeklyPriorities = $state<WeeklyPriority[]>([]);
  let loading = $state(false);

  // Load weekly priorities on mount
  onMount(async () => {
    const response = await fetch('/api/weekly/current');
    const data = await response.json();
    weeklyPriorities = data.priorities;
  });

  // Debounce extraction
  let debounceTimer: ReturnType<typeof setTimeout>;
  function onInputChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (userInput.length < 10) return; // Minimum length

      loading = true;
      try {
        const response = await fetch('/api/extract-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            text: userInput
          })
        });

        const data: ExtractEntryResponse = await response.json();
        extracted = data.extracted;
        confidence = data.confidence;
        suggestions = data.suggestions || [];
      } catch (error) {
        console.error('Extraction failed:', error);
      } finally {
        loading = false;
      }
    }, 500); // 500ms debounce
  }
</script>

<div class="container">
  <!-- Weekly Priorities Widget -->
  <div class="weekly-widget">
    <h3>This Week's Priorities</h3>
    {#each weeklyPriorities as priority}
      <div class="priority">
        <span>{priority.text}</span>
        <div class="progress-bar">
          <div style="width: {priority.progress_percent}%"></div>
        </div>
        <span>{priority.days_active}/{priority.total_days} days</span>
      </div>
    {/each}
  </div>

  <!-- Chat Input -->
  <div class="chat-area">
    <textarea
      bind:value={userInput}
      oninput={onInputChange}
      placeholder="Paste voice transcript or type your entry..."
    />

    {#if loading}
      <div class="loading">Extracting...</div>
    {/if}

    {#if suggestions.length > 0}
      <div class="suggestions">
        {#each suggestions as suggestion}
          <p>💡 {suggestion}</p>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Extracted Data Sidebar -->
  <div class="sidebar">
    <h3>Extracted Data</h3>

    {#if confidence > 0}
      <div class="confidence" class:low={confidence < 0.7}>
        Confidence: {Math.round(confidence * 100)}%
      </div>
    {/if}

    {#if extracted.sleep}
      <div class="section">
        <h4>Sleep</h4>
        <p>Bedtime: {extracted.sleep.bedtime}</p>
        <p>Wake: {extracted.sleep.wake_time}</p>
        <p>Duration: {extracted.sleep.duration}h</p>
        <p>Quality: {extracted.sleep.quality}</p>
      </div>
    {/if}

    {#if extracted.energy}
      <div class="section">
        <h4>Energy</h4>
        <p class="energy-{extracted.energy}">{extracted.energy}</p>
      </div>
    {/if}

    {#if extracted.intentions}
      <div class="section">
        <h4>Intentions</h4>
        <ul>
          {#each extracted.intentions as intention}
            <li>{intention}</li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if extracted.gratitude}
      <div class="section">
        <h4>Gratitude</h4>
        {#each extracted.gratitude as item}
          <p><strong>{item.thing}</strong> - {item.why}</p>
        {/each}
      </div>
    {/if}

    {#if extracted.food}
      <div class="section">
        <h4>Food</h4>
        {#each extracted.food as item}
          <p>{item.time}: {item.meal}
            {#if item.portion_grams}
              ({item.portion_grams[0]}g)
            {/if}
          </p>
        {/each}
      </div>
    {/if}

    <button onclick={saveToJournal}>💾 Save to Journal</button>
  </div>
</div>

<style>
  .confidence.low {
    color: orange;
    font-weight: bold;
  }
  .energy-high { color: green; }
  .energy-medium { color: blue; }
  .energy-low { color: orange; }
  .energy-drained { color: red; }
</style>
```

---

## Test Data Examples

### German Voice Transcript

```
Ins Bett um 22:00, aufgewacht um 06:00, 8h geschlafen, gute Qualität.
High energy heute.
Dankbar für Jani - sie hat mir Zeit gegeben zu arbeiten.
Gegessen um 12:00 300g Joghurt mit Beeren.
Laufen war heute, Sauna auch.
Heute will ich Leon follow-up machen und Sales Day 8 lernen.
```

### English Voice Transcript

```
Went to bed at 22:00, woke up at 06:00, slept 8 hours, excellent quality.
High energy today.
Grateful for Linus - he put on his shoes himself today.
Ate at 18:30 salmon with vegetables.
Running done, journaling done.
Focus today: Close Printulu deal and learn SPIN framework.
```

### Minimal Input

```
8h geschlafen, high energy, dankbar für Jani
```

---

## API Response Examples

### Extract Entry Response (German)

```json
{
  "extracted": {
    "sleep": {
      "bedtime": "22:00",
      "wake_time": "06:00",
      "duration": "8.0",
      "quality": "good"
    },
    "energy": "high",
    "habits": {
      "running": true,
      "sauna": true
    },
    "intentions": ["Leon follow-up machen", "Sales Day 8 lernen"],
    "gratitude": [
      {
        "thing": "Jani",
        "why": "sie hat mir Zeit gegeben zu arbeiten"
      }
    ],
    "food": [
      {
        "time": "12:00",
        "meal": "Joghurt mit Beeren",
        "portion_grams": [300]
      }
    ]
  },
  "confidence": 0.85,
  "suggestions": []
}
```

### Weekly Current Response

```json
{
  "week": "2026-W06",
  "priorities": [
    {
      "id": "2026-W06-p1",
      "text": "Close Printulu deal (Leon/Jerome/Abdul)",
      "days_active": 2,
      "total_days": 7,
      "progress_percent": 29,
      "status": "in_progress"
    },
    {
      "id": "2026-W06-p2",
      "text": "Sales learning Day 8-14 (SPIN framework)",
      "days_active": 2,
      "total_days": 7,
      "progress_percent": 29,
      "status": "in_progress"
    }
  ]
}
```

---

## Common Questions

### Q: What if the extraction is wrong?

**A**: Show a warning if `confidence < 0.7`. Always allow manual editing before saving.

### Q: How do I save the extracted data to a file?

**A**: Phase 2. For now, just display it. File writes coming next week.

### Q: Does extraction work in real-time as I type?

**A**: Use debouncing (500ms delay after user stops typing). See example above.

### Q: What if weekly plan file doesn't exist?

**A**: API returns realistic mock priorities. Show empty state or these mock priorities.

### Q: How do I handle API errors?

**A**: Wrap fetch in try/catch. Show user-friendly error message (toast/alert).

---

## Troubleshooting

### API returns 404

- Check dev server is running: `npm run dev`
- Verify URL: `http://localhost:5173/api/...` (no trailing slash)

### API returns 400 (Bad Request)

- Check request body has `date` and `text` fields
- Verify `Content-Type: application/json` header

### API returns 500 (Server Error)

- Check terminal for error logs
- Verify journal path exists: `/Users/amk/Projects/amk-journal/`

### Extraction returns empty object

- Text might be too short (need at least some keywords)
- Check patterns in `API-CONTRACTS.md`
- Try test examples above

### TypeScript errors

- Make sure types imported: `import type { ... } from '$lib/types'`
- Check TypeScript version: Should be 5.x
- Run `npm run check` to verify

---

## Next Steps

1. **Build chat UI** (text input + submit button)
2. **Build sidebar preview** (display extracted data)
3. **Build weekly widget** (show priorities with progress bars)
4. **Add error handling** (toast notifications)
5. **Add loading states** (spinners)
6. **Test with real voice transcripts** (German and English)

---

## Resources

- **Full API docs**: `API-CONTRACTS.md`
- **Backend guide**: `BACKEND-README.md`
- **Architecture**: `ARCHITECTURE-BACKEND.md`
- **Types**: `src/lib/types.ts`
- **Test script**: `./tests/api-test.sh`

---

## Questions?

If stuck, check in this order:

1. Run `./tests/api-test.sh` to verify backend works
2. Test with curl to isolate frontend vs backend
3. Check `API-CONTRACTS.md` for expected behavior
4. Review example integration above
5. Check browser console for errors

---

**Ready to code? Let's build this! 🚀**

**Backend Specialist Agent 2**
