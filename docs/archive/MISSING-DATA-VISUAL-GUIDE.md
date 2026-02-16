# Missing Data Detector - Visual Guide

Quick visual reference for the Missing Data Detector component.

## Component States

### 1. Empty Entry (0% Complete)

```
┌────────────────────────────────────────────┐
│ 📊 Data Capture Status                     │
│ 0% complete · Missing required fields      │
│                                        0%   │
│                                       ⭕    │
│ ❌ Missing (6)                              │
│ [😴 Sleep (required)]                      │
│ [⚡ Energy Level (required)]              │
│ [🎯 Daily Intentions (required)]          │
│ [🙏 Gratitude (required)]                 │
│ [✅ Habits]                                │
│ [🍽️ Food Log]                             │
│                                             │
│ 💡 Quick Add Suggestions                   │
│ • Add sleep info: "Ins Bett um 22:00..."   │
│ • Rate your energy: "High energy"...       │
│ • Set daily intentions: "Heute will ich..."│
│ • Share gratitude: "Dankbar für..."        │
└────────────────────────────────────────────┘
```

### 2. Partial Entry (50% Complete)

```
┌────────────────────────────────────────────┐
│ 📊 Data Capture Status                     │
│ 50% complete · Missing required fields     │
│                                       50%   │
│                                       ◐    │
│ ✅ Captured (3)                            │
│ [😴 Sleep] [⚡ Energy Level] [✅ Habits]   │
│                                             │
│ ❌ Missing (3)                              │
│ [🎯 Daily Intentions (required)]          │
│ [🙏 Gratitude (required)]                 │
│ [🍽️ Food Log]                             │
│                                             │
│ 💡 Quick Add Suggestions                   │
│ • Set daily intentions: "Heute will ich..."│
│ • Share gratitude: "Dankbar für..."        │
└────────────────────────────────────────────┘
```

### 3. Complete Entry (100%)

```
┌────────────────────────────────────────────┐
│ 📊 Data Capture Status                     │
│ 100% complete · All required fields captured│
│                                      100%   │
│                                       ⭕    │
│ ✅ Captured (6)                            │
│ [😴 Sleep] [⚡ Energy Level]               │
│ [🎯 Daily Intentions] [🙏 Gratitude]      │
│ [✅ Habits] [🍽️ Food Log]                 │
│                                             │
│ 🎉 Complete Entry!                         │
│ All fields captured. Great job             │
│ tracking your day!                          │
└────────────────────────────────────────────┘
```

## Compact Mode States

### Empty (Collapsed)

```
Data Completeness                        0%
[▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁] [Show Missing]
```

### Empty (Expanded)

```
Data Completeness                        0%
[▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁] [Hide Missing]

Missing Fields:
[😴 Sleep (req)] [⚡ Energy (req)] [🎯 Intentions (req)]
[🙏 Gratitude (req)] [✅ Habits] [🍽️ Food Log]
```

### Partial (50%)

```
Data Completeness                       50%
[█████████████▁▁▁▁▁▁▁] [Show Missing]
```

### Complete (100%)

```
Data Completeness                      100%
[████████████████████]
```

## Color Coding

- **Green** (✅): Fields successfully captured
- **Red** (❌): Missing required fields
- **Yellow** (⚠️): Missing optional fields
- **Blue** (💡): Helpful suggestions
- **Celebration** (🎉): 100% completion

## Field Categories

### Required Fields (Red when missing)

| Icon | Field            | Example                            |
| ---- | ---------------- | ---------------------------------- |
| 😴   | Sleep            | "Ins Bett um 22:00, 8h geschlafen" |
| ⚡   | Energy Level     | "High energy"                      |
| 🎯   | Daily Intentions | "Focus on exit pitch deck"         |
| 🙏   | Gratitude        | "Dankbar für Jani - support"       |

### Optional Fields (Yellow when missing)

| Icon | Field    | Example                          |
| ---- | -------- | -------------------------------- |
| ✅   | Habits   | "Laufen, Sauna, Elektrolyte"     |
| 🍽️   | Food Log | "Gegessen um 12:00 300g Joghurt" |

## Progress Indicators

### Circular (Full Mode)

```
  0%      25%     50%     75%    100%
  ○       ◔       ◐       ◕       ●
```

### Bar (Compact Mode)

```
  0%  [▁▁▁▁▁▁▁▁▁▁]
 25%  [█████▁▁▁▁▁]
 50%  [██████████▁▁▁▁▁]
 75%  [███████████████▁▁▁▁]
100%  [████████████████████]
```

## Integration Examples

### In Voice Recorder

```
┌──────────────────────────────────────┐
│ 🎤 Voice Input                       │
│ Record and transcribe your thoughts  │
│                                       │
│ [🎤 Start Recording]                 │
└──────────────────────────────────────┘

↓ (After transcription)

┌──────────────────────────────────────┐
│ ✓ Transcription Complete             │
│ "Ins Bett um 22:00, 8h geschlafen..." │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Data Completeness              33%   │
│ [██████▁▁▁▁▁▁▁▁▁▁] [Show Missing]    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📊 Data Capture Status               │
│ 33% complete · Missing required      │
│ (Full feedback component shown)      │
└──────────────────────────────────────┘
```

### In Entry Editor

```
┌──────────────────────────────────────┐
│ Daily Entry: 2026-02-11              │
│                                       │
│ [Text Editor]                        │
│                                       │
│ --- Sidebar ---                      │
│ Data Completeness              67%   │
│ [█████████████▁▁▁▁▁] [Show Missing]  │
│                                       │
│ Missing Fields:                      │
│ [🙏 Gratitude (required)]           │
│ [🍽️ Food Log]                       │
└──────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (Full Width)

```
┌────────────────────────────────────────────────────────────┐
│ 📊 Data Capture Status                            100% ⭕  │
│ 100% complete · All required fields captured              │
│                                                             │
│ ✅ Captured (6)                                            │
│ [😴 Sleep] [⚡ Energy] [🎯 Intentions]                    │
│ [🙏 Gratitude] [✅ Habits] [🍽️ Food]                     │
└────────────────────────────────────────────────────────────┘
```

### Mobile (Stacked)

```
┌──────────────────────────┐
│ 📊 Data Capture Status   │
│ 100% complete        ⭕  │
│ All required captured    │
│                          │
│ ✅ Captured (6)          │
│ [😴 Sleep]              │
│ [⚡ Energy Level]       │
│ [🎯 Daily Intentions]   │
│ [🙏 Gratitude]          │
│ [✅ Habits]             │
│ [🍽️ Food Log]          │
└──────────────────────────┘
```

## Animation States

### Loading/Extracting

```
┌────────────────────────────────────┐
│ ⏳ Extracting data...             │
│ [Spinner animation]                │
└────────────────────────────────────┘
```

### Success Animation

```
┌────────────────────────────────────┐
│ ✅ Data extracted!                │
│ [Fade-in animation]                │
└────────────────────────────────────┘
```

### Progress Update

```
67% → 83%
[█████████████▁▁▁▁▁▁] → [████████████████▁▁▁▁]
   (Smooth transition animation)
```

## Demo Scenarios

Visit `/demo-missing-data` to see:

1. **Empty Entry** - All fields missing
2. **Partial Entry** - Some captured, some missing
3. **Missing Required** - Optional captured, required missing
4. **Complete Entry** - All fields captured

Visit `/demo-voice-with-feedback` to test:

- Full voice → transcribe → extract → feedback flow
- Load example transcriptions
- See real-time updates

## Quick Reference

### When to Use Full Mode

- Entry creation/editing pages
- Detailed feedback needed
- User completing form
- Desktop/tablet views

### When to Use Compact Mode

- Inline with voice recorder
- Dashboard widgets
- Mobile views
- Space-constrained layouts

### Trigger Conditions

- Show after transcription completes
- Show after manual text extraction
- Update when data changes
- Auto-collapse when 100% complete
