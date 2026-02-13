# Missing Data Feedback Component

Real-time feedback component that analyzes extracted journal data and shows users what fields are captured and what's missing.

## Purpose

After voice transcription or manual text entry, users need immediate feedback on:

- What data was successfully captured
- What required fields are missing
- What optional fields could enhance their entry
- Contextual suggestions on how to add missing data

## Features

- **Visual Progress**: Circular progress indicator and progress bar
- **Field Status**: Color-coded badges (green = captured, red = missing required, yellow = missing optional)
- **Smart Suggestions**: Contextual prompts for each missing field
- **Two Modes**: Full detailed view and compact inline mode
- **Completeness Tracking**: Percentage and required field validation

## Usage

### Basic Usage (Full Mode)

```svelte
<script>
  import MissingDataFeedback from '$lib/components/MissingDataFeedback.svelte';
  import type { ExtractedData } from '$lib/types';

  let extractedData: ExtractedData = {
    sleep: { duration: '7.5', quality: 'good' },
    energy: 'high',
    habits: { running: true }
  };
</script>

<MissingDataFeedback extracted={extractedData} />
```

### Compact Mode (Inline)

```svelte
<MissingDataFeedback extracted={extractedData} compact={true} />
```

### Integration with VoiceRecorder

```svelte
<script>
  import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
  import type { ExtractedData } from '$lib/types';

  let extractedData: ExtractedData | null = null;

  async function handleTranscription(text: string) {
    // Call /api/extract-entry
    const response = await fetch('/api/extract-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        text: text
      })
    });

    const result = await response.json();
    extractedData = result.extracted;
  }
</script>

<VoiceRecorder
  onTranscription={handleTranscription}
  extractedData={extractedData}
  showFeedback={true}
/>
```

## Field Definitions

### Required Fields

| Field        | Label            | Icon | Suggestion                                        |
| ------------ | ---------------- | ---- | ------------------------------------------------- |
| `sleep`      | Sleep            | 😴   | "Ins Bett um 22:00, 8h geschlafen, gute Qualität" |
| `energy`     | Energy Level     | ⚡   | "High energy" / "Medium energy" / etc.            |
| `intentions` | Daily Intentions | 🎯   | "Heute will ich..." or "Focus: [goals]"           |
| `gratitude`  | Gratitude        | 🙏   | "Dankbar für [thing] - [reason]" (3 things)       |

### Optional Fields

| Field    | Label    | Icon | Suggestion                                |
| -------- | -------- | ---- | ----------------------------------------- |
| `habits` | Habits   | ✅   | "Laufen", "Sauna", "Sales Learning", etc. |
| `food`   | Food Log | 🍽️   | "Gegessen um 12:00 300g Joghurt"          |

## Component API

### Props

```typescript
interface Props {
  extracted: ExtractedData; // Extracted data from /api/extract-entry
  compact?: boolean; // Default: false (full mode)
}
```

### ExtractedData Type

```typescript
interface ExtractedData {
  sleep?: {
    bedtime?: string; // "HH:MM"
    wake_time?: string; // "HH:MM"
    duration?: string; // "7.5" (hours)
    quality?: "poor" | "fair" | "good" | "excellent";
  };
  energy?: "high" | "medium" | "low" | "drained";
  habits?: {
    running?: boolean;
    sauna?: boolean;
    sales_learning?: boolean;
    journaling?: boolean;
    morning_electrolytes?: boolean;
    vampire_shot?: boolean;
    supplements?: boolean;
    // ... etc
  };
  intentions?: string[];
  gratitude?: Array<{
    thing: string;
    why: string;
  }>;
  food?: Array<{
    time: string;
    meal: string;
    portion_grams?: number[];
    usda_ids?: string[];
  }>;
}
```

## Analysis Functions

### `analyzeMissingData()`

Analyzes extracted data and returns detailed feedback.

```typescript
import { analyzeMissingData } from "$lib/utils/missing-data-analyzer";

const analysis = analyzeMissingData(extractedData);
// Returns: { captured: [], missing: [], suggestions: [] }
```

### `calculateCompleteness()`

Calculates completion percentage and required field validation.

```typescript
import { calculateCompleteness } from "$lib/utils/missing-data-analyzer";

const completeness = calculateCompleteness(analysis);
// Returns: { percentage: 67, requiredComplete: false }
```

### `formatFieldList()`

Formats field list for display.

```typescript
import { formatFieldList } from "$lib/utils/missing-data-analyzer";

const formatted = formatFieldList(analysis.captured);
// Returns: "😴 Sleep, ⚡ Energy Level, 🎯 Daily Intentions"
```

## Visual Examples

### Full Mode

Shows:

- Circular progress indicator (0-100%)
- All captured fields (green badges)
- All missing fields (red for required, yellow for optional)
- Blue suggestion box with contextual prompts
- Success celebration when 100% complete

### Compact Mode

Shows:

- Horizontal progress bar with percentage
- "Show Missing" toggle button
- Expandable missing fields list

## Demo Pages

1. **Component Demo**: `/demo-missing-data`
   - Test different data scenarios
   - Compare full vs compact modes
   - View raw JSON

2. **Full Workflow Demo**: `/demo-voice-with-feedback`
   - Record voice → Transcribe → Extract → Feedback
   - Complete end-to-end experience
   - Load example transcriptions

## Best Practices

1. **Auto-extract after transcription**: Don't make user click "extract" button
2. **Show compact mode during recording**: Real-time progress feedback
3. **Show full mode after extraction**: Detailed analysis and suggestions
4. **Cache extracted data**: Don't re-extract on every render
5. **Handle empty state**: Show helpful message when no data yet

## Future Enhancements

- [ ] Click suggestion to pre-fill voice prompt
- [ ] Voice suggestions (read missing fields aloud)
- [ ] Field-specific extraction confidence scores
- [ ] Historical completeness trends
- [ ] Smart defaults based on past patterns
- [ ] Integration with daily entry editor

## Related Files

- Component: `/src/lib/components/MissingDataFeedback.svelte`
- Analysis: `/src/lib/utils/missing-data-analyzer.ts`
- Types: `/src/lib/types.ts`
- API: `/src/routes/api/extract-entry/+server.ts`
- Demo: `/src/routes/demo-missing-data/+page.svelte`
