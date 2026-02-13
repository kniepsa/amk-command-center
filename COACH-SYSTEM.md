# 6-Coach Guru System

## Overview

The Command Center voice journal includes 6 AI coaching personas that automatically detect context and provide targeted guidance:

| Coach                  | Icon | Color  | Focus Areas                           | Triggers                                      |
| ---------------------- | ---- | ------ | ------------------------------------- | --------------------------------------------- |
| **Bill Campbell**      | 🏈   | Blue   | Leadership, Team, Feedback            | team, conflict, feedback, trust               |
| **Machiavelli**        | 👑   | Purple | M&A Strategy, Power, Negotiation      | leverage, negotiation, strategy, politics     |
| **Sales Coach (SPIN)** | 💼   | Green  | Discovery, Objection Handling, Pitch  | discovery, call, objection, pitch             |
| **M&A Advisor**        | 💰   | Yellow | Valuation, Deal Structure, Exit       | valuation, price, structure, investor         |
| **Stoic Advisor**      | 🏛️   | Slate  | Calm, Perspective, Anxiety Management | anxious, frustrated, overwhelmed, perspective |
| **Parenting Guru**     | 👨‍👩‍👧‍👦   | Pink   | Montessori Principles, Connection     | tantrum, boundaries, learning, connection     |

## How It Works

### Detection Logic

1. **Voice Input**: User records journal entry via `/voice` page
2. **Transcription**: Replicate Whisper transcribes audio
3. **Coach Detection**: System scans transcription for keywords (up to 2 coaches per entry)
4. **Challenge Display**: Relevant coaches appear as dismissible cards with:
   - Principle (core philosophy)
   - Question (reflective prompt)
   - Quote (wisdom from that coach's perspective)
   - Confidence score (keyword match percentage)

### Example Scenarios

#### Scenario 1: M&A Stress

**Input**: "Stressed about Leon negotiation, worried about price"

**Detected Coaches**:

- 👑 **Machiavelli** (negotiation, price)
  - Principle: "He who appears weak gains advantage"
  - Question: "What do they THINK you want vs what you ACTUALLY want?"
- 🏛️ **Stoic** (stressed, worried)
  - Principle: "You can't control outcomes, only your response"
  - Question: "What part of this situation is ACTUALLY in your control?"

#### Scenario 2: Sales Call Prep

**Input**: "Discovery call with Colin tomorrow, need to discuss ROI and value prop"

**Detected Coaches**:

- 💼 **Sales Coach** (discovery, call)
  - Principle: "Questions reveal pain, pain creates urgency"
  - Question: "What SITUATION questions uncover their context?"
- 💰 **M&A Advisor** (ROI, value)
  - Principle: "Value is what the buyer will pay"
  - Question: "What value drivers can you QUANTIFY for this specific buyer?"

#### Scenario 3: Parenting Challenge

**Input**: "@linus had a tantrum at bedtime, crying and screaming"

**Detected Coaches**:

- 👨‍👩‍👧‍👦 **Parenting Guru** (tantrum, crying, screaming)
  - Principle: "Connection before correction"
  - Question: "What NEED is driving this behavior? (tired, hungry, overwhelmed)"
  - Quote: "The child is not empty; they are full of potential. — Maria Montessori"

## Architecture

### File Structure

```
src/
├── lib/
│   ├── utils/
│   │   ├── coach-detector.ts      # 6-coach detection engine (770 lines)
│   │   └── campbell-detector.ts   # Legacy (backward compatibility)
│   └── components/
│       └── CoachChallenge.svelte  # Multi-coach display component
└── routes/
    └── voice/
        └── +page.svelte           # Voice journal with coach integration
```

### Key Functions

#### `detectCoachChallenges(text: string, maxCoaches: number = 2): CoachChallenge[]`

Main detection function. Scans text for keywords, returns up to `maxCoaches` challenges sorted by confidence.

**Parameters**:

- `text` - Transcribed voice input
- `maxCoaches` - Maximum number of coaches to trigger (default: 2)

**Returns**: Array of `CoachChallenge` objects

#### `detectCampbellTriggers(text: string): CoachChallenge | null`

Legacy function for backward compatibility. Returns only Campbell challenges.

### Data Types

```typescript
export type CoachType =
  | "campbell"
  | "machiavelli"
  | "sales"
  | "ma_advisor"
  | "stoic"
  | "parenting";

export interface CoachChallenge {
  type: CoachType; // Coach identifier
  category: CoachCategory; // Specific trigger category
  icon: string; // Emoji icon
  name: string; // Display name
  color: string; // Tailwind color class
  principle: string; // Core philosophy
  question: string; // Reflective prompt
  quote?: string; // Optional wisdom quote
  confidence: number; // Match confidence (0-1)
}
```

## Configuration

### Adding New Keywords

Edit `COACH_CONFIGS` in `src/lib/utils/coach-detector.ts`:

```typescript
{
  type: 'sales',
  name: 'Sales Coach (SPIN)',
  icon: '💼',
  color: 'green',
  triggers: [
    {
      category: 'discovery',
      keywords: ['discovery', 'call', 'meeting', 'prospect', 'client'],
      principle: 'Questions reveal pain, pain creates urgency',
      questions: [
        'What SITUATION questions uncover their context?',
        'What PROBLEM questions expose their pain?'
      ],
      quotes: [
        'People don\'t buy because they understand. They buy because they feel understood.'
      ]
    }
  ]
}
```

### Adjusting Detection Threshold

Change minimum confidence in `detectCoachChallenges()`:

```typescript
if (bestMatch && bestMatch.confidence > 0.1) {
  // Lower threshold = more sensitive (0.05)
  // Higher threshold = more selective (0.3)
}
```

### Enabling More Coaches Per Entry

Update `maxCoaches` parameter in voice page:

```typescript
// In src/routes/voice/+page.svelte
coachChallenges = detectCoachChallenges(text, 3); // Allow 3 coaches
```

## Testing

### Manual Testing

1. Navigate to `/voice`
2. Start recording
3. Speak test scenarios (see `test-coaches.js`)
4. Verify:
   - Up to 2 coaches appear
   - Correct icons and colors
   - Dismissal works
   - Challenges saved to journal entry

### Automated Testing

```bash
# Run test scenarios
node test-coaches.js

# Expected output:
# Test 1: M&A stress → Machiavelli + Stoic
# Test 2: Sales discovery + ROI → Sales + M&A
# Test 3: Parenting tantrum → Parenting only
# Test 4: Team conflict + feedback → Campbell only
# Test 5: Anxiety + control → Stoic only
# Test 6: Investor pitch + valuation → M&A + Sales
```

## Usage Patterns

### Common Combinations

| Scenario               | Primary Coach | Secondary Coach |
| ---------------------- | ------------- | --------------- |
| M&A Deal Stress        | Machiavelli   | Stoic           |
| Sales Call Prep        | Sales         | M&A Advisor     |
| Team Conflict          | Campbell      | Stoic           |
| Parenting Challenge    | Parenting     | Stoic           |
| Investor Pitch         | M&A Advisor   | Sales           |
| Negotiation Power Play | Machiavelli   | M&A Advisor     |
| Overwhelmed Leader     | Campbell      | Stoic           |
| Exit Strategy Planning | M&A Advisor   | Machiavelli     |

### Single Coach Triggers

Some contexts are so specific only one coach appears:

- **Campbell only**: Pure team/feedback issues
- **Parenting only**: Child-specific scenarios
- **Stoic only**: Pure emotional regulation
- **Sales only**: Prospecting/qualification
- **M&A only**: Pure valuation/structure
- **Machiavelli only**: Pure power dynamics

## Customization

### Adding a 7th Coach

1. Add coach config to `COACH_CONFIGS` array
2. Add new `CoachType` to type definition
3. Add new categories to `CoachCategory` type
4. Update coach color mapping in `CoachChallenge.svelte`
5. Add test scenarios to `test-coaches.js`

### Localization (German Support)

Keywords already include German translations:

- `frustrated` → `frustrat`, `wütend`, `sauer`
- `learning` → `lernen`, `lehren`
- `team` → `führung`, `leitung`

Add more in `keywords` array for each trigger.

## Performance

- **Detection time**: <10ms per entry
- **Memory footprint**: ~50KB for full coach config
- **Max coaches per entry**: 2 (configurable)
- **Confidence calculation**: Keyword match ratio (simple, fast)

## Future Enhancements

### Planned Features

1. **Coach Selector UI**: Toggle which coaches are active (localStorage persistence)
2. **Learning from Feedback**: Track which coaches user dismisses → adjust confidence
3. **Context History**: "Last time you had this issue, Stoic helped most"
4. **Multi-Language**: Full German translations for principles/questions
5. **Voice of Coach**: Different writing styles in journal entry (formal vs casual)

### Integration Ideas

- **Notion Sync**: Coach challenges as database properties
- **Weekly Review**: "This week, Machiavelli appeared 5x → focus on M&A stress management"
- **Coach Analytics**: Dashboard showing coach frequency distribution
- **Smart Recommendations**: "You haven't heard from Stoic in 2 weeks → here's a reminder..."

## Credits

- **Bill Campbell**: _Trillion Dollar Coach_ by Schmidt, Rosenberg, Eagle
- **Machiavelli**: _The Prince_ by Niccolò Machiavelli
- **SPIN Selling**: _SPIN Selling_ by Neil Rackham
- **M&A Framework**: Goldman Sachs/BCG valuation methodologies
- **Stoicism**: Marcus Aurelius, Seneca, Epictetus
- **Montessori**: Maria Montessori's educational philosophy

## Support

Questions? Issues? Check:

1. `test-coaches.js` - Test scenarios
2. `src/lib/utils/coach-detector.ts` - Detection logic (770 lines, well-commented)
3. `src/routes/voice/+page.svelte` - Integration example

---

**Last Updated**: 2026-02-11
**Version**: 1.0.0
**Status**: ✅ Production Ready
