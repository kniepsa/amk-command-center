# Coach Trigger Keywords - Quick Reference

This document lists all trigger keywords for automatic coach activation.

## Bill Campbell (Leadership Coach) 📚

**Primary Triggers**:

- @team
- #leadership
- conflict
- management
- people issues

**Secondary Triggers**:

- team
- employee
- direct report
- feedback
- performance review
- one-on-one
- difficult conversation

**Activation Scenarios**:

- "I need to give @team feedback on..."
- "Having a conflict with my manager..."
- "#leadership question about handling..."

---

## Machiavelli (Power Dynamics) 🎭

**Primary Triggers**:

- M&A
- negotiation
- Leon
- Jerome
- power
- deal
- buyer

**Secondary Triggers**:

- seller
- leverage
- ghosting
- tactical
- positioning
- competitive
- advantage

**Name-Based Triggers** (specific people):

- Leon (Leon/BSC deal)
- Jerome (Webprinter buyer)
- Colin (Lithotech)
- Damian (Renform)
- Omar (5-company portfolio)

**Activation Scenarios**:

- "Leon hasn't responded to my WhatsApp..."
- "Negotiating with Jerome on platform price..."
- "How to position against competitor?"

---

## Peter Drucker (Strategic Advisor) 📊

**Primary Triggers**:

- strategy
- investment
- big decision
- assumption
- first principles

**Secondary Triggers**:

- planning
- objective
- framework
- analytics
- metric
- measurement
- effectiveness

**Activation Scenarios**:

- "Making a big investment decision on..."
- "What's the right strategy for..."
- "Questioning my assumptions about..."

---

## Stoic Advisor (Emotional Grounding) 🏛️

**Primary Triggers**:

- frustration
- anxiety
- stressed
- worried
- control

**Secondary Triggers**:

- overwhelmed
- angry
- upset
- anxious
- panic
- fear
- concern

**Activation Scenarios**:

- "Feeling frustrated about buyer ghosting..."
- "Anxious about deal timeline..."
- "Worried I can't control..."

---

## Parenting Guru (Montessori Expert) 🧒

**Primary Triggers**:

- @kinder
- @linus
- @anton
- @cari
- #parenting
- kids
- children

**Secondary Triggers**:

- tantrum
- behavior
- discipline
- bedtime
- eating
- siblings
- daycare
- preschool

**Activation Scenarios**:

- "@linus refusing to put on shoes..."
- "Kids having tantrum about..."
- "#parenting question on discipline..."

---

## Sales Coach (SPIN Selling) 💼

**Primary Triggers**:

- pitch
- sales
- #sales
- discovery
- client
- buyer meeting

**Secondary Triggers**:

- presentation
- demo
- proposal
- objection
- closing
- follow-up
- qualification

**Activation Scenarios**:

- "Preparing pitch for Colin tomorrow..."
- "Client meeting - discovery questions?"
- "How to handle objection about price?"

---

## M&A Advisor (Exit Strategy) 💰

**Primary Triggers**:

- exit
- valuation
- deal structure
- EBITDA
- platform sale

**Secondary Triggers**:

- acquisition
- buyer
- multiple
- payback
- ROI
- earnout
- escrow
- handover

**Activation Scenarios**:

- "Valuing platform at R20M..."
- "Exit strategy for Printulu..."
- "Deal structure: cash vs equity?"

---

## Multi-Coach Triggers

Some keywords activate multiple coaches (ranked by relevance):

### "Deal" / "Negotiation"

1. Machiavelli (primary)
2. M&A Advisor (secondary)

### "Strategy" + "Exit"

1. Peter Drucker (primary)
2. M&A Advisor (secondary)

### "Team" + "Conflict"

1. Bill Campbell (primary)
2. Stoic Advisor (secondary - if emotional)

### "Buyer" + "Meeting"

1. Sales Coach (primary - if discovery phase)
2. Machiavelli (secondary - if negotiation phase)
3. M&A Advisor (tertiary - if exit context)

---

## Contextual Activation (Beyond Keywords)

### Sentiment-Based

- **Frustration detected** → Stoic Advisor
- **Excitement about opportunity** → Peter Drucker (strategic thinking)
- **Anxiety about outcome** → Stoic Advisor

### Semantic Patterns

- Questions starting with "Should I..." → Multiple coaches (context-dependent)
- "How to handle..." → Relevant domain expert
- "What would [coach] say..." → Direct activation

### People Mentions

- @team, @employee → Bill Campbell
- @kinder, @linus, @anton, @cari → Parenting Guru
- Buyer names (Leon, Jerome, etc.) → Machiavelli + M&A Advisor

---

## Trigger Testing

### Test Cases

**Input**: "Leon ghosted me after saying 'anytime'. Should I call?"
**Expected Coaches**: Machiavelli (power dynamics), Bill Campbell (direct communication)

**Input**: "Preparing pitch deck for Colin at Lithotech tomorrow"
**Expected Coaches**: Sales Coach (pitch), M&A Advisor (deal context)

**Input**: "@linus refusing to wear shoes again"
**Expected Coaches**: Parenting Guru

**Input**: "Feeling overwhelmed by exit timeline - 90 days to close"
**Expected Coaches**: Stoic Advisor (emotional), M&A Advisor (timeline strategy)

**Input**: "What's the ONE assumption that could kill this deal?"
**Expected Coaches**: Peter Drucker (first principles)

---

## Adding New Triggers

To add triggers for a coach:

1. Edit coach config: `/Users/amk/.config/command-center/coaches.json`
2. Add to `triggers` array for specific coach
3. Save and reload

Example:

```json
{
  "id": "bill-campbell",
  "triggers": [
    "@team",
    "#leadership",
    "conflict",
    "NEW_TRIGGER_HERE" // Add here
  ]
}
```

---

## Disabling Triggers

To prevent auto-activation:

1. Go to Settings: `/settings/coaches`
2. Toggle off "Auto-activate based on context"
3. Coach will only appear when explicitly requested

---

**Last Updated**: 2026-02-11
**Maintained By**: Agent 3 (AI/Prompt Engineer)
