# Missing Data Detector

Real-time feedback system that analyzes voice transcriptions and shows users what journal fields are captured and what's missing.

## Overview

After a user speaks and transcription completes, the Missing Data Detector provides instant visual feedback:

- ✅ **Green badges**: Fields successfully captured (e.g., "Sleep (8h)", "Energy (high)")
- ❌ **Red badges**: Missing required fields (e.g., "Gratitude", "Intentions")
- ⚠️ **Yellow badges**: Missing optional fields (e.g., "Food Log", "Habits")
- 💡 **Smart suggestions**: Contextual prompts for each missing field

## Quick Start

```bash
# Start development server
npm run dev

# Visit demo pages
open http://localhost:5173/demo-missing-data
open http://localhost:5173/demo-voice-with-feedback
```

## Usage

### Basic Component

```svelte
<script>
  import MissingDataFeedback from '$lib/components/MissingDataFeedback.svelte';

  let extractedData = {
    sleep: { duration: '8', quality: 'good' },
    energy: 'high',
    habits: { running: true }
  };
</script>

<MissingDataFeedback extracted={extractedData} />
```

### Compact Mode

```svelte
<MissingDataFeedback extracted={extractedData} compact={true} />
```

### With Voice Recorder

```svelte
<VoiceRecorder
  onTranscription={handleTranscription}
  extractedData={extractedData}
  showFeedback={true}
/>
```

## Files

### Core Implementation

- `/src/lib/utils/missing-data-analyzer.ts` - Analysis engine
- `/src/lib/components/MissingDataFeedback.svelte` - Visual component
- `/src/lib/components/VoiceRecorder.svelte` - Updated with feedback support

### Demos

- `/src/routes/demo-missing-data/+page.svelte` - Component showcase
- `/src/routes/demo-voice-with-feedback/+page.svelte` - Full workflow

### Documentation

- `/src/lib/components/MissingDataFeedback.md` - Component API docs
- `/MISSING-DATA-DETECTOR.md` - Implementation summary
- `/MISSING-DATA-VISUAL-GUIDE.md` - Visual reference guide

## Features

| Feature                  | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| **Real-time Analysis**   | Instant feedback after transcription                   |
| **Progress Tracking**    | Circular (full mode) and bar (compact mode) indicators |
| **Field Categorization** | Required vs optional fields                            |
| **Smart Suggestions**    | Contextual prompts for missing data                    |
| **Two Display Modes**    | Full (detailed) and compact (inline)                   |
| **TypeScript**           | Fully typed with strict mode                           |
| **Reactive**             | Svelte 5 runes ($state, $derived)                      |

## Field Tracking

### Required (4 fields)

- 😴 **Sleep** - Bedtime, wake time, duration, quality
- ⚡ **Energy** - high | medium | low | drained
- 🎯 **Intentions** - Daily goals/focus areas
- 🙏 **Gratitude** - 3 things you're grateful for

### Optional (2 fields)

- ✅ **Habits** - Running, sauna, supplements, etc.
- 🍽️ **Food Log** - Meals with times and portions

## Demo Scenarios

Visit `/demo-missing-data` to test:

1. **Empty Entry** (0% complete) - All fields missing
2. **Partial Entry** (50% complete) - Some captured, some missing
3. **Missing Required** (33% complete) - Optional captured, required missing
4. **Complete Entry** (100% complete) - All fields captured

## Integration Flow

```
User speaks
    ↓
Transcription (Groq API)
    ↓
POST /api/extract-entry
    ↓
Analysis (missing-data-analyzer)
    ↓
Visual Feedback (MissingDataFeedback)
    ↓
User sees: captured ✅, missing ❌, suggestions 💡
```

## Future Enhancements

### Phase 2: Interactive Suggestions

- Click suggestion to pre-fill voice prompt
- Voice reading of missing fields
- Smart autocomplete

### Phase 3: Intelligence

- Field-specific confidence scores
- Historical completeness trends
- Smart defaults from patterns

### Phase 4: Integration

- Daily entry editor
- Weekly review tracking
- Gamification (streaks, badges)

## Documentation

- **Component API**: `MissingDataFeedback.md`
- **Implementation**: `MISSING-DATA-DETECTOR.md`
- **Visual Guide**: `MISSING-DATA-VISUAL-GUIDE.md`

## Tech Stack

- **Framework**: SvelteKit + Svelte 5
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: Svelte 5 runes ($state, $derived, $props)

## Performance

- Analysis: O(n) where n = 6 fields (negligible)
- Bundle: ~3KB (component + analyzer)
- Reactivity: Only re-analyzes when data changes

## Browser Support

- Chrome, Firefox, Safari, Edge (modern versions)
- JavaScript required
- Svelte 5 runtime required

---

**Need help?** See inline code comments or demo pages for detailed examples.
