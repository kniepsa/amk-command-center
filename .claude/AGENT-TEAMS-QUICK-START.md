# Agent Teams Quick Start Guide

**Feature**: Claude Code Experimental Agent Teams
**Status**: Enabled ✅ (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
**Use Case**: Build Command Center V2 with 4 parallel agents

---

## Two Modes

### 1. Split-Panes Mode (Visual, Recommended)

See all agents working simultaneously in split screen.

**Requirements**:

- `tmux` installed ✅ (already installed: 3.6a)
- Claude Code restarted after tmux install

**How to Use**:

```bash
# Method 1: Command Palette
Cmd+Shift+P → "Agent Teams: Start Split Panes"

# Method 2: Chat command
/agent-teams split-panes

# You'll see 4 terminal panes:
┌─────────────────┬─────────────────┐
│  Agent 1 🎨     │  Agent 2 ⚙️     │
│  Frontend       │  Backend        │
│  Working on...  │  Working on...  │
├─────────────────┼─────────────────┤
│  Agent 3 🧠     │  Agent 4 📚     │
│  Coaches        │  Learning       │
│  Working on...  │  Working on...  │
└─────────────────┴─────────────────┘
```

**Give Instructions**:

```
Type in main chat:
"All agents: Read the PRDs and confirm your responsibilities.

Agent 1 (Frontend): Build TodayTab.svelte
Agent 2 (Backend): Create API routes
Agent 3 (Coach): Design coach prompts
Agent 4 (Learning): Create curriculum UI"

Each agent works independently, reports back when done.
```

---

### 2. In-Process Mode (No tmux needed)

Agents run in background, you review results sequentially.

**How to Use**:

```bash
# Spawn agents with Shift+Up
Shift+Up → Type task → Enter

# Example: Spawn 4 agents
Shift+Up → "Agent Frontend: Build TodayTab" → Enter
Shift+Up → "Agent Backend: Create APIs" → Enter
Shift+Up → "Agent Coach: Design prompts" → Enter
Shift+Up → "Agent Learning: Build curriculum" → Enter

# Wait 2-3 minutes for agents to finish...

# Review results with Shift+Down
Shift+Down → See Agent Frontend output
Shift+Down → See Agent Backend output
Shift+Down → See Agent Coach output
Shift+Down → See Agent Learning output
```

---

## Command Center V2 - Full Launch Sequence

### Day 1: Foundation (Parallel)

**In split-panes mode:**

```
Give all 4 agents this instruction:

"We're building Command Center V2. Read all PRDs in .claude/ folder.

Agent 1 (Frontend):
- Create TodayTab.svelte with 3-column layout
- Left: WeeklyPrioritiesSidebar (20% width)
- Center: ChatInterface (60% width)
- Right: ExtractionPreview (20% width)
- Use Svelte 5 runes ($state, $derived)
- Mock data for now

Agent 2 (Backend):
- Create /api/extract-entry endpoint
- Input: { text: string, date: string }
- Output: { sleep: {...}, energy: string, habits: {...}, intentions: string[] }
- Use Claude API (Sonnet 4.5)
- Mock implementation first, real Claude later

Agent 3 (Coach):
- Design coaches.json data model
- Create prompt templates for:
  * Bill Campbell (leadership)
  * Machiavelli (negotiations)
  * Peter Drucker (strategy)
- Context detection logic (keywords → coach activation)

Agent 4 (Learning):
- Create LearningTab.svelte dashboard
- Show: Sales curriculum (Day 8/30)
- Progress bar, this week's lessons
- 'Start Lesson' button (no Socratic dialogue yet)

All agents: Report file paths created and any blockers."
```

**Expected Time**: 30-45 minutes
**Result**: 4 components built in parallel

---

### Day 3: Integration Standup

**Check agent outputs:**

```
"All agents: Report your progress.

What files did you create?
What data models did you define?
What dependencies do you need from other agents?

Specifically:
- Agent 1: What API contract do you need from Agent 2?
- Agent 2: Confirm request/response formats
- Agent 3: Where do coach cards render in Agent 1's UI?
- Agent 4: How does 'Today's Lesson' widget integrate?"
```

**Resolve conflicts, update API contracts**

---

### Day 7: Full Integration

**Test end-to-end flow:**

```
"All agents: Integration test.

Agent 1 + Agent 2:
- User types in chat → Calls /api/extract-entry → Shows preview
- Test with: 'Ins Bett um 22:00, 8h geschlafen, gute Qualität'

Agent 1 + Agent 3:
- Coach card appears in chat when keywords detected
- Test with: 'Leon hasn't responded to my WhatsApp'

Agent 1 + Agent 4:
- 'Today's Lesson' widget shows in left sidebar
- Click 'Start Lesson' → Opens LearningTab

Report any integration bugs."
```

---

## Agent Communication Patterns

### Pattern 1: Broadcast to All

```
"All agents: [instruction for everyone]"
```

### Pattern 2: Specific Instructions

```
"Agent 1: [frontend task]
 Agent 2: [backend task]
 Agent 3: [coach task]
 Agent 4: [learning task]"
```

### Pattern 3: Agent-to-Agent Coordination

```
"Agent 1: Ask Agent 2 what the exact API response format is.
 Agent 2: Respond with TypeScript interface definition."
```

### Pattern 4: Debugging (Focus)

```
"Agent 2: There's a bug in /api/extract-entry.
 Debug why sleep extraction returns null.
 Other agents: Stand by."
```

---

## Token Management

### Cost Awareness

- **4 agents = 4x tokens**
- Each agent has full context (PRDs, files, conversation)
- Expected cost: $20-30 for full Command Center V2

### Optimization Tips

1. **Use mock data initially** (avoid Claude API calls during development)
2. **Limit agent count** (only spawn what you need)
3. **Batch instructions** (don't spawn agents for tiny tasks)
4. **Kill idle agents** (if agent finishes early, dismiss it)

---

## Troubleshooting

### Issue: Split-panes mode doesn't work

**Fix**:

```bash
# Check tmux installed
which tmux
# Should output: /opt/homebrew/bin/tmux

# Restart Claude Code
# (tmux was installed but PATH loaded after Claude started)
```

### Issue: Agents conflict (edit same file)

**Fix**:

```
"All agents: STOP.

Agent 1 owns: /lib/components/*.svelte
Agent 2 owns: /routes/api/**/*.ts
Agent 3 owns: /lib/coaches/**/*.ts
Agent 4 owns: /learning/curricula/**/*.md

Confirm your file ownership. Don't touch other agents' files."
```

### Issue: One agent falls behind (blocks others)

**Fix**:

```
"Agent 1, 3, 4: Use mock data from Agent 2.
 Don't wait for real API implementation.

 Agent 2: Finish your work, but you're not blocking."
```

---

## Example: First Agent Teams Session

```
You: "Launch Agent Teams in split-panes mode"

Claude: [Spawns 4 panes]

You: "All agents: We're building Command Center V2.
      Read PRD-COMMAND-CENTER-V2-ARCHITECTURE.md.

      Agent Frontend: Build TodayTab.svelte skeleton
      Agent Backend: Create /api/extract-entry (mock)
      Agent Coach: Define coach data model
      Agent Learning: Create LearningTab.svelte

      Report when done (30 min timeout)."

[Wait 30 minutes...]

Agent Frontend: ✅ Created TodayTab.svelte (3-column layout)
Agent Backend: ✅ Created /api/extract-entry (returns mock data)
Agent Coach: ✅ Created coaches.json schema
Agent Learning: ✅ Created LearningTab.svelte dashboard

You: "Great! Now integrate:
      Agent Frontend: Call Agent Backend's API from chat
      Agent Backend: Return real extraction (use Claude)
      Agent Coach: Show coach cards in Frontend's chat
      Agent Learning: Add 'Today's Lesson' to Frontend sidebar"

[Agents work together...]

All Agents: ✅ Integration complete, demo ready
```

---

## Best Practices

### DO ✅

- Give clear, specific tasks per agent
- Define file ownership upfront
- Use mock data to unblock agents
- Run integration tests on Day 3, Day 7
- Review all agents' code before merging

### DON'T ❌

- Spawn agents for tiny tasks (not worth 4x cost)
- Let agents edit same files without coordination
- Skip integration tests (will cause bugs later)
- Forget to kill idle agents (wastes tokens)
- Give vague instructions ("make it better")

---

## Ready to Launch?

**Recommended first command:**

```
"Launch Agent Teams (split-panes mode).

All agents: Read all PRDs in .claude/ folder.

Agent Frontend: Create TodayTab.svelte shell (3-column layout, Svelte 5)
Agent Backend: Create /api/extract-entry (mock response)
Agent Coach: Design coaches.json + prompt templates
Agent Learning: Create LearningTab.svelte (progress dashboard)

Work for 30 minutes, report back with file paths created."
```

**This kicks off Command Center V2 implementation!** 🚀
