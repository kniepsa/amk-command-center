# PRD: AI Coach/Challenger System

**Status**: Planning
**Priority**: P1 (High - Strategic Differentiation)
**Owner**: AMK
**Created**: 2026-02-11

---

## Problem Statement

The journal system has **7 guru modes** (Bill Campbell, Peter Drucker, Stoic Advisor, etc.) that should challenge/coach the user based on context, but they're:

- Only mentioned in CLAUDE.md (not in UI)
- No way to select which coach to activate
- No persistent settings for coach preferences
- No visual feedback when a coach is "speaking"

**Current**: Generic Claude responses
**Desired**: "Bill Campbell challenges your Leon negotiation: 'Are you being direct enough? Call him, don't wait for WhatsApp response.'"

---

## Goals

1. **Primary**: Settings page to configure active coaches
2. **Secondary**: Coach comments appear in chat (visually distinct)
3. **Tertiary**: Context-aware coach activation (leadership issues → Campbell)

---

## Coach Profiles (from CLAUDE.md)

| Coach                  | Triggers                                  | Tone                            | Example Challenge                                                                                             |
| ---------------------- | ----------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Bill Campbell**      | `@team`, conflicts, leadership            | Direct but caring               | "Stop tiptoeing. Tell Damian he ghosted you - test if he respects you."                                       |
| **Peter Drucker**      | Strategy, investments, big decisions      | First principles, data-driven   | "What's the ONE assumption that, if wrong, kills this deal?"                                                  |
| **Machiavelli**        | M&A, negotiations, power dynamics         | Ruthless pragmatism             | "Leon went from 'anytime' to ghosting in 7 days. He's testing your desperation. Radio silence is power."      |
| **Stoic Advisor**      | Frustration, anxiety, emotional reactions | Calm, rational, perspective     | "You can't control Leon's response. You can control your next 3 calls."                                       |
| **Parenting Guru**     | `@kinder`, `#parenting`                   | Warmth + Structure (Montessori) | "Linus refusing shoes? Let him choose between red or blue. Control the options, not the child."               |
| **Sales Coach (SPIN)** | Client pitches, `#sales`                  | Discovery-focused, pain-driven  | "You led with platform features. Did you ask Colin about his 40 reps' coordination problem first?"            |
| **M&A Advisor**        | Exit planning, valuation, deal structure  | Analytical, risk-aware          | "R20M asking price = 10.5x EBITDA. Vertically integrated buyers see 3.77x. You're selling to wrong audience." |

---

## User Journeys

### Journey 1: Configure Active Coaches

1. Click ⚙️ Settings → "AI Coaches"
2. See list of 7 coaches with toggle switches
3. Enable: Campbell (leadership), Drucker (strategy), Machiavelli (negotiations)
4. Set "Challenge Frequency": Low / Medium / High
5. Save preferences

### Journey 2: Receive Coach Challenge in Chat

1. User types: "Leon hasn't responded to my WhatsApp. Should I call him?"
2. Claude responds normally, then...
3. **Machiavelli chimes in** (visually distinct):
   > 🎭 **Machiavelli**: He went from "for you anytime" to ghosting in 7 days. This is a test. Radio silence shows you're not desperate. Focus on Jerome and Abdul—let Leon see he's losing exclusivity.
4. User can click "Ignore" or "Tell me more"

### Journey 3: Context-Aware Auto-Activation

1. User mentions `@linus` in entry
2. **Parenting Guru auto-activates** (even if not explicitly enabled)
3. Provides Montessori-based insight on toddler behavior
4. User sees "🧒 Parenting Guru mode activated" badge

---

## UI Layout

### Settings Page (`/settings/coaches`)

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ AI Coaches & Challengers                                │
├─────────────────────────────────────────────────────────────┤
│  Configure which expert advisors challenge your thinking.   │
│                                                              │
│  🎯 Leadership & Management                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [✅] Bill Campbell - Direct but caring leadership     │  │
│  │      "Stop tiptoeing. Tell the truth with care."      │  │
│  │      Triggers: @team, conflicts, people issues        │  │
│  │      Challenge Level: [Low] [●Med] [High]             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  📊 Strategy & Decisions                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [✅] Peter Drucker - First principles thinking        │  │
│  │      "What's the ONE assumption that kills this?"     │  │
│  │      Triggers: Big decisions, investments             │  │
│  │      Challenge Level: [Low] [●Med] [High]             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  🎭 Negotiations & Power                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [✅] Machiavelli - Ruthless pragmatism                │  │
│  │      "He's testing your desperation. Show none."      │  │
│  │      Triggers: M&A, negotiations, competitive moves   │  │
│  │      Challenge Level: [●Low] [Med] [High]             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [ 4 more coaches... ]                                      │
│                                                              │
│  Advanced Options:                                          │
│  [ ] Auto-activate coaches based on context                │
│  [ ] Show coach feedback immediately (vs on request)        │
│  [ ] Allow coaches to debate each other (experimental)      │
│                                                              │
│  [💾 Save Preferences]                                      │
└─────────────────────────────────────────────────────────────┘
```

### Coach Comment in Chat

```
┌─────────────────────────────────────────────────────────────┐
│  Claude:                                                     │
│  Leon hasn't responded yet. Here are 3 options:             │
│  1. Call him directly (shows urgency)                       │
│  2. Wait 24-48h (gives him space)                           │
│  3. Message alternative buyers (creates FOMO)               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🎭 Machiavelli                      [Challenge Level] │  │
│  │ ──────────────────────────────────────────────────── │  │
│  │ He went from "for you anytime" to ghosting in 7 days.│  │
│  │ This is a power move. Don't chase—focus on Jerome    │  │
│  │ and Abdul. Let Leon see he's losing exclusivity.     │  │
│  │                                                       │  │
│  │ The Prince, Ch. 17: "It is better to be feared than  │  │
│  │ loved, if you cannot be both." Show you have options.│  │
│  │                                                       │  │
│  │ [💡 Tell me more] [🙈 Ignore this time]              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📚 Bill Campbell                     [Challenge Level] │  │
│  │ ──────────────────────────────────────────────────── │  │
│  │ Just call him. Seriously. "Hey Leon, you said       │  │
│  │ 'anytime'—I took that seriously. 15 minutes Friday?" │  │
│  │                                                       │  │
│  │ Direct beats games. If he respects you, he'll        │  │
│  │ apologize and schedule. If not, you learn fast.      │  │
│  │                                                       │  │
│  │ [💡 Tell me more] [🙈 Ignore this time]              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Phase 1: Settings & Basic Activation (Week 1)

- [ ] `/settings/coaches` page with toggle switches
- [ ] Save preferences to `/users/amk/.config/coaches.json`
- [ ] System prompt injection: "Act as [active coaches] when relevant"
- [ ] Basic coach badges in chat UI

### Phase 2: Context-Aware Activation (Week 2)

- [ ] Keyword triggers: `@name` → Coach mapping
- [ ] Topic detection (M&A, parenting, sales) → Coach activation
- [ ] Show "🎭 Coach activated" toast notification

### Phase 3: Multi-Coach Debates (Week 3, Experimental)

- [ ] "Ask the Council" button → Multiple coaches respond
- [ ] Coaches debate each other (Machiavelli vs Campbell on negotiation tactics)
- [ ] User picks which advice to follow

---

## Coach Prompt Templates

### Bill Campbell

```
You are Bill Campbell, the legendary "Trillion Dollar Coach."
- Be direct but show you care
- Challenge bullshit, demand honesty
- Focus on relationships over tactics
- Quote: "Your title makes you a manager. Your people make you a leader."

User context: {journal_excerpt}
Challenge the user's approach to {situation} with tough love.
```

### Machiavelli

```
You are Niccolò Machiavelli, author of The Prince.
- Ruthlessly pragmatic
- Power dynamics analysis
- No moralizing—what WORKS matters
- Quote: "Everyone sees what you appear to be, few experience what you really are."

User context: {journal_excerpt}
Analyze the power dynamics in {situation}. Who holds leverage? What's the optimal move?
```

---

## Data Model

### Coach Config (`users/amk/.config/coaches.json`)

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
    },
    {
      "id": "machiavelli",
      "name": "Machiavelli",
      "enabled": true,
      "challenge_level": "low",
      "triggers": ["M&A", "negotiation", "Leon", "Jerome"],
      "auto_activate": false
    }
  ],
  "settings": {
    "show_immediately": true,
    "allow_debates": false,
    "max_coaches_per_response": 2
  }
}
```

---

## API Spec

### POST `/api/coaches/challenge`

**Request:**

```json
{
  "user_message": "Leon hasn't responded. Should I call?",
  "context": {
    "recent_entries": ["2026-02-10.md", "2026-02-11.md"],
    "active_threads": ["printulu-exit-leon-hybrid-structure-proposal.md"]
  },
  "active_coaches": ["bill-campbell", "machiavelli"]
}
```

**Response:**

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
    },
    {
      "coach_id": "bill-campbell",
      "coach_name": "Bill Campbell",
      "icon": "📚",
      "message": "Just call him. Seriously...",
      "confidence": 0.76
    }
  ]
}
```

---

## Success Metrics

- **Primary**: 60% of chat sessions include at least 1 coach challenge within 2 weeks
- **Secondary**: Users rate coach advice as "helpful" >70% of the time
- **Tertiary**: Users change behavior based on coach advice (measure by [OPEN] task creation)

---

## Dependencies

- User preferences storage (`coaches.json`)
- Claude API with system prompt customization
- UI components for coach badges/cards

---

## Risks & Mitigations

| Risk                                       | Mitigation                                            |
| ------------------------------------------ | ----------------------------------------------------- |
| Coaches contradict each other (confusing)  | Show as "debate" feature, user picks winner           |
| Tone too harsh (Machiavelli) scares users  | Challenge level settings (Low/Med/High)               |
| Coach advice is generic (not personalized) | Pass journal context + active threads to API          |
| Users ignore coaches (feature unused)      | A/B test: Auto-show vs on-request, measure engagement |

---

## Open Questions

- [ ] Should coaches have "memory" (remember past challenges)?
- [ ] Should users be able to create custom coaches? (e.g., "My father's advice style")
- [ ] How to handle conflicting advice? (Campbell says "call", Machiavelli says "wait")
- [ ] Should coaches proactively challenge? (Daily "Coach's Corner" widget)
- [ ] Can coaches reference specific guru docs? (e.g., `[[bill-campbell]].md`)
