# AI Coach System Documentation

## Overview

The AI Coach System provides context-aware coaching from 7 expert advisors who challenge the user's thinking based on detected triggers in their input.

## Architecture

```
User Input → Trigger Detection → Coach Activation → Challenge Generation → UI Display
```

### Components

1. **Coach Prompt Templates** (`/src/lib/coaches/*.ts`)
   - System prompts for each coach personality
   - Trigger keywords for auto-activation
   - Challenge level modifiers (low/medium/high)

2. **Coach Configuration** (`~/.config/command-center/coaches.json`)
   - User preferences for enabled coaches
   - Challenge level settings
   - Auto-activation toggles

3. **UI Components**
   - `CoachChallenge.svelte` - Visual card for coach responses
   - `/settings/coaches` - Configuration page

4. **Type Definitions** (`/src/lib/types/coach.ts`)
   - TypeScript interfaces for type safety

## Coaches

### 1. Bill Campbell (Leadership Coach)

**Icon**: 📚
**Personality**: Direct but caring, focuses on relationships
**Style**: Uses sports metaphors, demands honesty

**Trigger Keywords**:

- @team, #leadership
- conflict, management, people issues
- team, employee

**Challenge Levels**:

- **Low**: Encouraging and supportive
- **Medium**: Direct about issues, challenges honesty
- **High**: Brutally honest, "Just call them. Seriously."

**Example Quote**: "Your title makes you a manager. Your people make you a leader."

---

### 2. Machiavelli (Power Dynamics Advisor)

**Icon**: 🎭
**Personality**: Ruthlessly pragmatic, analyzes power with surgical precision
**Style**: Clinical analysis, no moralizing

**Trigger Keywords**:

- M&A, negotiation, power, deal
- Leon, Jerome (specific buyers)
- buyer, seller, leverage, ghosting

**Challenge Levels**:

- **Low**: Neutral observation of power dynamics
- **Medium**: Analyze leverage, suggest tactical repositioning
- **High**: "He's testing your desperation. Radio silence is power."

**Example Quote**: "Everyone sees what you appear to be, few experience what you really are."

---

### 3. Peter Drucker (Strategic Advisor)

**Icon**: 📊
**Personality**: Systematic analyst, first principles thinker
**Style**: Penetrating questions, exposes assumptions

**Trigger Keywords**:

- strategy, investment, big decision
- assumption, first principles
- planning, objective

**Challenge Levels**:

- **Low**: Clarifying questions, gentle 5 Questions framework
- **Medium**: Challenge 1-2 key assumptions directly
- **High**: "Your entire strategy rests on THIS assumption. If it's wrong, everything fails."

**Example Quote**: "What gets measured gets managed."

**The 5 Questions**:

1. What is our mission?
2. Who is our customer?
3. What does the customer value?
4. What are our results?
5. What is our plan?

---

### 4. Stoic Advisor (Emotional Grounding)

**Icon**: 🏛️
**Personality**: Calm, rational, perspective-giving
**Style**: Dichotomy of control framework

**Trigger Keywords**:

- frustration, anxiety, stressed, worried
- control, overwhelmed, angry, upset

**Challenge Levels**:

- **Low**: Gentle reminder of dichotomy of control
- **Medium**: Clearly separate controllable vs uncontrollable
- **High**: "You're spending 80% mental energy on things you can't control."

**Example Quote**: "You have power over your mind - not outside events."

**Framework**:

1. What can you control?
2. What is outside your control?
3. Given what you CAN control, what's the next right move?
4. Perspective: How much will this matter in 5 years?

---

### 5. Parenting Guru (Child Development Expert)

**Icon**: 🧒
**Personality**: Warm, empathetic, structured (Montessori-based)
**Style**: Developmental explanations, concrete tactics

**Trigger Keywords**:

- @kinder, @linus, @anton, @cari
- #parenting, kids, children
- tantrum, behavior

**Challenge Levels**:

- **Low**: Validate frustration, explain developmental stage
- **Medium**: Give 2-3 Montessori tactics with explanations
- **High**: "Yelling teaches them yelling works. Instead, try: [calm consequence]"

**Montessori Principles**:

1. Follow the child (observe first)
2. Prepared environment (make good choices easy)
3. Independence ("Help me do it myself")
4. Natural consequences (not punishment)
5. Respect the child as a person

**Example Tactic**: "Refusing shoes? Let him choose between red or blue. Control the options, not the child."

---

### 6. Sales Coach (SPIN Selling Expert)

**Icon**: 💼
**Personality**: Discovery-focused, challenges premature pitching
**Style**: SPIN framework, pain amplification

**Trigger Keywords**:

- pitch, sales, #sales
- discovery, client, buyer meeting
- presentation, demo

**Challenge Levels**:

- **Low**: Remind of SPIN framework, suggest discovery questions
- **Medium**: Challenge early pitching, "Did you discover PAIN first?"
- **High**: "You led with features. That's why they didn't engage. Redo the call."

**SPIN Framework**:

1. **Situation**: Understand current state
2. **Problem**: Uncover pain
3. **Implication**: Amplify pain (quantify cost)
4. **Need-Payoff**: Let THEM articulate solution

**Example Challenge**: "Did you ask Colin about his 40 reps' coordination problem BEFORE pitching the platform?"

---

### 7. M&A Advisor (Exit Strategy Expert)

**Icon**: 💰
**Personality**: Analytical, risk-aware, Goldman/BCG-level
**Style**: Valuation frameworks, deal structure analysis

**Trigger Keywords**:

- exit, valuation, deal structure
- EBITDA, platform sale, acquisition
- buyer, multiple

**Challenge Levels**:

- **Low**: Ask clarifying questions about valuation method
- **Medium**: Challenge valuation assumptions with analysis
- **High**: "You're pitching 10x to buyers who see 3-5x comps. Find vertically-integrated buyers."

**Valuation Methods**:

- EBITDA Multiple: SaaS 8-12x, Traditional 3-5x, Strategic 5-15x
- Revenue Multiple: High-growth 2-5x, Stable 0.5-2x
- Strategic Value: Buyer's ROI, payback period (3-4 years = fair)

**Deal Structure Questions**:

1. What method are you using? What comps?
2. Why is this buyer paying premium? What's their ROI?
3. All cash? Earn-out? What are risks?
4. What's your BATNA?

---

## Trigger Detection Logic

### Primary Triggers (Direct Matches)

- Exact string matches (case-insensitive)
- `@mentions` for people
- `#hashtags` for topics

### Contextual Triggers (Semantic Analysis)

- Frustration words → Stoic Advisor
- Deal/buyer language → M&A Advisor + Machiavelli
- Strategy/decision words → Peter Drucker

### Multi-Coach Scenarios

When input matches multiple coaches:

1. Show up to `max_coaches_per_response` (default: 2)
2. Prioritize by confidence score
3. Avoid conflicting advice (e.g., Campbell + Machiavelli both on same issue)

### Auto-Activation Rules

```typescript
if (coach.enabled && coach.auto_activate) {
  if (inputContainsTrigger(userInput, coach.triggers)) {
    activateCoach(coach);
  }
}
```

## Configuration

### User Config Location

`/Users/amk/.config/command-center/coaches.json`

### Schema

```json
{
  "active_coaches": [
    {
      "id": "bill-campbell",
      "name": "Bill Campbell",
      "enabled": true,
      "challenge_level": "medium",
      "triggers": ["@team", "#leadership", "conflict"],
      "auto_activate": true
    }
  ],
  "settings": {
    "show_immediately": true,
    "allow_debates": false,
    "max_coaches_per_response": 2
  }
}
```

## API Endpoints

### GET `/api/coaches/config`

Returns user's coach configuration.

**Response**:

```json
{
  "active_coaches": [...],
  "settings": {...}
}
```

### POST `/api/coaches/config`

Saves updated coach configuration.

**Request Body**: Same as GET response

### POST `/api/coaches/challenge`

Generates coach challenges for user input.

**Request**:

```json
{
  "user_message": "Leon hasn't responded. Should I call?",
  "context": {
    "recent_entries": ["2026-02-10.md"],
    "active_threads": ["printulu-exit-leon.md"]
  },
  "active_coaches": ["bill-campbell", "machiavelli"]
}
```

**Response**:

```json
{
  "challenges": [
    {
      "coach_id": "machiavelli",
      "coach_name": "Machiavelli",
      "icon": "🎭",
      "message": "He went from 'anytime' to ghosting in 7 days...",
      "quote": "The Prince, Ch. 17: 'It is better to be feared...'",
      "confidence": 0.89
    }
  ]
}
```

## UI Integration

### CoachChallenge Component

**Usage**:

```svelte
<script>
  import CoachChallenge from '$lib/components/CoachChallenge.svelte';

  const challenge = {
    coach_id: 'bill-campbell',
    coach_name: 'Bill Campbell',
    icon: '📚',
    message: 'Just call him. Seriously.',
    confidence: 0.85
  };

  function handleTellMeMore() {
    // Request deeper analysis
  }

  function handleIgnore() {
    // Hide this challenge
  }
</script>

<CoachChallenge
  {challenge}
  onTellMeMore={handleTellMeMore}
  onIgnore={handleIgnore}
/>
```

### Settings Page

Access via: `/settings/coaches`

Features:

- Toggle coaches on/off
- Adjust challenge level (low/medium/high)
- Enable/disable auto-activation
- Advanced options (debates, max coaches, etc.)

## Challenge Level Modifiers

Each coach has 3 challenge levels that adjust tone:

| Level      | Description         | Example (Bill Campbell)         |
| ---------- | ------------------- | ------------------------------- |
| **Low**    | Gentle, encouraging | "Consider being more direct..." |
| **Medium** | Direct, challenging | "Are you being honest enough?"  |
| **High**   | Brutally honest     | "Stop tiptoeing. Call him NOW." |

## Best Practices

### For Developers

1. **Always pass context**: More context = better challenges

   ```typescript
   const context = {
     recent_entries: getRecentEntries(7), // Last 7 days
     active_threads: getActiveThreads(),
     people: extractMentions(userInput),
   };
   ```

2. **Respect user preferences**: Check `enabled` before showing coach
3. **Handle low confidence**: Show warning if `confidence < 0.7`
4. **Avoid coach conflicts**: Don't show Campbell + Machiavelli on same issue

### For Users

1. **Start with low challenge levels**: Adjust upward if needed
2. **Enable auto-activation selectively**: Too many coaches = noise
3. **Use "Ignore this time"**: Trains the system over time (future)
4. **Experiment with debates**: Advanced users can enable multi-coach debates

## Future Enhancements

- [ ] Coach memory (remember past challenges)
- [ ] Custom coaches (user-defined personalities)
- [ ] Coach debates (multiple coaches argue different approaches)
- [ ] Learning from feedback ("Ignore" trains relevance)
- [ ] Proactive challenges (Daily "Coach's Corner" widget)
- [ ] Reference guru docs (e.g., `[[bill-campbell]].md`)

## Troubleshooting

### Coach not activating

1. Check if coach is enabled in settings
2. Verify trigger keywords match input
3. Confirm `auto_activate` is true

### Wrong challenge level

- Update in settings: `/settings/coaches`
- Changes take effect immediately

### Too many coaches appearing

- Reduce `max_coaches_per_response` in settings
- Disable less relevant coaches

### Challenges feel generic

- Ensure sufficient context is passed
- Consider increasing challenge level for more specific advice

---

**Last Updated**: 2026-02-11
**Version**: 1.0.0
