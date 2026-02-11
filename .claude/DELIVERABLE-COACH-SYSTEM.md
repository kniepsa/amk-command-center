# AI Coach System - Deliverable Summary

**Agent**: Agent 3 (AI/Prompt Engineer)
**Date**: 2026-02-11
**Duration**: 45 minutes
**Status**: ✅ Complete

---

## Mission

Design the AI Coach system for Command Center V2 with 7 expert advisor personalities.

---

## Deliverables

### 1. ✅ Coach Data Model

**Location**: `/Users/amk/.config/command-center/coaches.json`

**Schema**:

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
    // ... 6 more coaches
  ],
  "settings": {
    "show_immediately": true,
    "allow_debates": false,
    "max_coaches_per_response": 2
  }
}
```

**Features**:

- Per-coach enable/disable
- Challenge level (low/medium/high)
- Trigger keyword arrays
- Auto-activation toggles
- Global settings

---

### 2. ✅ TypeScript Types

**Location**: `/src/lib/types/coach.ts`

**Interfaces**:

- `CoachConfig` - Individual coach settings
- `CoachSettings` - Global preferences
- `CoachesConfig` - Full configuration
- `CoachChallenge` - Challenge response format
- `CoachPromptTemplate` - Coach prompt structure

---

### 3. ✅ 7 Coach Prompt Templates

**Location**: `/src/lib/coaches/*.ts`

| Coach          | File                | Icon | Specialty                            |
| -------------- | ------------------- | ---- | ------------------------------------ |
| Bill Campbell  | `bill-campbell.ts`  | 📚   | Leadership, direct communication     |
| Machiavelli    | `machiavelli.ts`    | 🎭   | Power dynamics, negotiations         |
| Peter Drucker  | `peter-drucker.ts`  | 📊   | Strategic thinking, first principles |
| Stoic Advisor  | `stoic-advisor.ts`  | 🏛️   | Emotional grounding, control         |
| Parenting Guru | `parenting-guru.ts` | 🧒   | Montessori, child development        |
| Sales Coach    | `sales-coach.ts`    | 💼   | SPIN Selling, discovery              |
| M&A Advisor    | `ma-advisor.ts`     | 💰   | Valuation, deal structure            |

**Each template includes**:

- System prompt with personality & style
- Trigger keywords array
- Icon emoji
- Challenge level modifiers (low/medium/high)
- Example quotes and frameworks

**Total**: 7 coaches × ~80 lines = ~560 lines of carefully crafted prompts

---

### 4. ✅ CoachChallenge Component

**Location**: `/src/lib/components/CoachChallenge.svelte`

**Features**:

- Visual card design with gradient background
- Coach icon, name, and badge
- Message display with pre-wrap formatting
- Quote display (if provided)
- Confidence warning (if < 70%)
- Action buttons: "Tell me more" & "Ignore this time"
- Expandable section for follow-ups
- Dark mode support

**Design**:

- Purple gradient (brand colors: #667eea → #764ba2)
- Gold accent stripe at top
- Glassmorphism effects
- Responsive layout
- Smooth transitions

---

### 5. ✅ Settings Page

**Location**: `/src/routes/settings/coaches/+page.svelte`

**Features**:

- List all 7 coaches with toggle switches
- Challenge level selector (Low/Medium/High buttons)
- Auto-activate toggle per coach
- Trigger keywords display
- Advanced options:
  - Show immediately vs on request
  - Allow coach debates (experimental)
  - Max coaches per response
- Save preferences button
- Success/error messages
- Dark mode support

**Layout**:

- Categorized by domain (Leadership, Strategy, Well-being, Business)
- Collapsible coach cards
- Visual icons for quick recognition
- Loading states

---

### 6. ✅ Documentation

#### Main Documentation

**Location**: `.claude/docs/COACH-SYSTEM.md`

**Contents** (8,000+ words):

- Architecture overview
- Detailed coach profiles
- Trigger detection logic
- Configuration schema
- API endpoint specs
- UI integration examples
- Challenge level modifiers
- Best practices
- Troubleshooting guide

#### Trigger Reference

**Location**: `.claude/docs/COACH-TRIGGERS-REFERENCE.md`

**Contents**:

- All trigger keywords by coach
- Multi-coach trigger scenarios
- Contextual activation rules
- Test cases
- How to add/disable triggers

---

## Key Features

### Context-Aware Activation

Coaches activate automatically based on:

1. **Keyword triggers**: Direct matches (e.g., "@team" → Bill Campbell)
2. **People mentions**: @linus → Parenting Guru, Leon → Machiavelli
3. **Sentiment analysis**: Frustration → Stoic Advisor
4. **Semantic patterns**: "Should I call?" → Multiple coaches debate

### Challenge Level Modifiers

Each coach adjusts tone based on user preference:

- **Low**: Gentle, encouraging, supportive
- **Medium**: Direct, challenging assumptions
- **High**: Brutally honest, no-holds-barred

### Personality Depth

Each coach has:

- Distinct voice and style
- Real frameworks (SPIN, Montessori, Stoic dichotomy)
- Authentic quotes from source material
- Domain expertise (M&A, sales, parenting, etc.)

---

## Integration Points

### API Endpoints (to be implemented)

```
GET  /api/coaches/config       # Load user preferences
POST /api/coaches/config       # Save user preferences
POST /api/coaches/challenge    # Generate coach challenges
```

### UI Integration

```svelte
<!-- In chat interface -->
<script>
  import CoachChallenge from '$lib/components/CoachChallenge.svelte';
</script>

{#each challenges as challenge}
  <CoachChallenge
    {challenge}
    onTellMeMore={() => handleDeeper(challenge)}
    onIgnore={() => hideChallenge(challenge)}
  />
{/each}
```

### Settings Link

```svelte
<!-- In main navigation -->
<a href="/settings/coaches">
  ⚙️ AI Coaches
</a>
```

---

## File Structure

```
/Users/amk/Projects/amk-command-center/
├── src/
│   ├── lib/
│   │   ├── types/
│   │   │   └── coach.ts              # TypeScript types
│   │   ├── coaches/
│   │   │   ├── index.ts              # Coach registry
│   │   │   ├── bill-campbell.ts      # Campbell prompt
│   │   │   ├── machiavelli.ts        # Machiavelli prompt
│   │   │   ├── peter-drucker.ts      # Drucker prompt
│   │   │   ├── stoic-advisor.ts      # Stoic prompt
│   │   │   ├── parenting-guru.ts     # Parenting prompt
│   │   │   ├── sales-coach.ts        # Sales prompt
│   │   │   └── ma-advisor.ts         # M&A prompt
│   │   └── components/
│   │       └── CoachChallenge.svelte # UI component
│   └── routes/
│       └── settings/
│           └── coaches/
│               └── +page.svelte      # Settings page
└── .claude/
    └── docs/
        ├── COACH-SYSTEM.md           # Full documentation
        └── COACH-TRIGGERS-REFERENCE.md # Trigger keywords

/Users/amk/.config/command-center/
└── coaches.json                      # User preferences
```

---

## Example Usage

### Scenario 1: Leon Ghosting

**User Input**: "Leon hasn't responded to my WhatsApp. Should I call him?"

**Detected Triggers**: Leon (name), ghosting, negotiation

**Activated Coaches**:

1. **Machiavelli** (High relevance - power dynamics)

   > "He went from 'for you anytime' to ghosting in 7 days. This is a power move. Don't chase—focus on Jerome and Abdul. Let Leon see he's losing exclusivity."
   >
   > _The Prince, Ch. 17: "It is better to be feared than loved, if you cannot be both."_

2. **Bill Campbell** (Medium relevance - direct communication)
   > "Just call him. Seriously. 'Hey Leon, you said anytime—I took that seriously. 15 minutes Friday?' Direct beats games. If he respects you, he'll apologize and schedule."

**User can**:

- Click "Tell me more" for deeper analysis
- Click "Ignore this time" to hide challenge
- Continue conversation with coach context

---

### Scenario 2: Parenting Issue

**User Input**: "@linus refusing to put on shoes again. Tantrum every morning."

**Detected Triggers**: @linus, refusing, tantrum

**Activated Coaches**:

1. **Parenting Guru** (High relevance)
   > "This is developmentally normal for 4-year-olds—they're testing autonomy. Instead of forcing, offer choice: 'Red shoes or blue shoes?' Control the options, not the child. Repeat 10-20 times for habit formation."
   >
   > _Montessori Principle: Prepared environment makes good choices easy._

---

### Scenario 3: Strategic Decision

**User Input**: "Thinking about accepting Leon's R25M offer. Big decision."

**Detected Triggers**: big decision, strategic, Leon, R25M (valuation)

**Activated Coaches**:

1. **Peter Drucker** (High relevance - strategic thinking)

   > "What's the ONE assumption that, if wrong, kills this deal? You're assuming Leon will close in 90 days. What if he stalls for 6 months? What's your BATNA?"

2. **M&A Advisor** (High relevance - deal structure)
   > "R25M on what EBITDA? Deal structure matters more than headline number. All cash? Earn-out? Escrow? Run 3 scenarios: best case, base case, worst case. What's the risk-adjusted value?"

---

## Next Steps (for Integration Team)

### Phase 1: Backend API (Week 1)

- [ ] Implement `/api/coaches/config` endpoints
- [ ] Load user preferences from `~/.config/command-center/coaches.json`
- [ ] Save updated preferences
- [ ] Implement trigger detection logic

### Phase 2: Coach Challenge Generation (Week 2)

- [ ] Implement `/api/coaches/challenge` endpoint
- [ ] Pass user message + context to Claude API
- [ ] Inject relevant coach prompts into system message
- [ ] Parse and format coach responses
- [ ] Return structured challenge objects

### Phase 3: UI Integration (Week 2-3)

- [ ] Add CoachChallenge to chat interface
- [ ] Hook up "Tell me more" button
- [ ] Implement "Ignore" functionality
- [ ] Add Settings link to navigation
- [ ] Test end-to-end flow

### Phase 4: Polish & Testing (Week 3)

- [ ] Test all 7 coaches with real scenarios
- [ ] Adjust challenge levels based on feedback
- [ ] Fine-tune trigger detection
- [ ] Add analytics (which coaches used most?)

---

## Success Metrics

**Primary** (2 weeks):

- 60% of chat sessions include at least 1 coach challenge

**Secondary** (1 month):

- Users rate coach advice as "helpful" >70% of time
- Average challenge level adjusted by users (shows engagement)

**Tertiary** (3 months):

- Users change behavior based on coach advice
- Measure: [OPEN] tasks created from coach suggestions

---

## Open Questions for Product Team

1. **Coach Memory**: Should coaches remember past challenges?
   - Pro: More personalized advice
   - Con: Complexity, privacy concerns

2. **Custom Coaches**: Allow users to create custom coaches?
   - Pro: Ultimate flexibility
   - Con: Prompt engineering required from user

3. **Coach Debates**: Enable multi-coach debates on same issue?
   - Pro: Shows multiple perspectives
   - Con: May be confusing/overwhelming

4. **Proactive Challenges**: Daily "Coach's Corner" widget?
   - Pro: Keeps users engaged
   - Con: May feel intrusive

---

## Technical Debt & Future Work

### Immediate

- API endpoint implementation (backend team)
- Trigger detection service (NLP or simple regex)
- User preference persistence

### Medium-term

- Coach memory system
- Learning from "Ignore" clicks (relevance training)
- Analytics dashboard (most active coaches)

### Long-term

- Custom coach builder UI
- Multi-coach debate mode
- Integration with journal guru modes (sync)
- Voice-activated coach queries

---

## Credits

**Designed by**: Agent 3 (AI/Prompt Engineer)
**Based on**: `.claude/PRD-AI-COACHES.md`
**Inspired by**: AMK Journal guru modes (CLAUDE.md)

**Coach Personalities Adapted From**:

- Bill Campbell: _Trillion Dollar Coach_ by Eric Schmidt et al.
- Machiavelli: _The Prince_ by Niccolò Machiavelli
- Peter Drucker: _The Effective Executive_ and MBO framework
- Stoic Advisor: Marcus Aurelius, Epictetus, Seneca
- Parenting Guru: Montessori Method
- Sales Coach: SPIN Selling by Neil Rackham
- M&A Advisor: Goldman Sachs/BCG methodologies

---

**Total Effort**:

- Planning: 5 minutes
- Development: 35 minutes
- Documentation: 5 minutes
- **Total**: 45 minutes

**Lines of Code**: ~1,500 (TypeScript + Svelte)
**Documentation**: ~10,000 words

---

## Contact

Questions? Issues? Enhancements?
→ Tag Agent 3 in Claude Code chat
→ Reference: `.claude/docs/COACH-SYSTEM.md`

**Status**: ✅ READY FOR INTEGRATION
