import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Mock data - in real system, this would read from database
// Location: users/amk/learning/progress.md and curricula/[course]/day-XX.md

export const GET: RequestHandler = async () => {
  // TODO: Read from actual progress file
  const activeCourse = {
    courseId: "sales",
    courseName: "Sales Mastery",
    courseIcon: "💰",
    currentDay: 1,
    totalDays: 30,
    startDate: "2026-02-13",
    lesson: {
      day: 1,
      title: "The Psychology of Buying",
      framework: "SPIN Selling - Situation Questions",
      content: `# Day 1: The Psychology of Buying

## Today's Framework: SPIN Selling - Situation Questions

### Core Concept
Before you can sell anything, you must understand the buyer's current state. Situation questions establish context.

### The Framework
**SPIN** = Situation → Problem → Implication → Need-Payoff

**Today's Focus: Situation Questions**
- "Walk me through your current process for..."
- "How are you handling X today?"
- "What does your team structure look like?"

### Why It Matters
Most salespeople pitch too early. Situation questions build:
1. **Trust** - You're listening, not selling
2. **Context** - You understand their world
3. **Permission** - To ask harder questions later

### Real Example
**Bad**: "We have a platform that automates print ordering."
**Good**: "How do your sales reps currently handle supplier coordination?"

→ User reveals: "They spend 60% of their time on calls with suppliers."
→ NOW you can sell (you've quantified the pain).

### Today's Challenge
Pick 1 customer conversation today. Ask ONLY situation questions for the first 10 minutes. No pitching.

### Reflection Prompt
What surprised you about what the customer revealed when you stopped pitching and started listening?`,
      keyTakeaways: [
        "Situation questions = understanding before selling",
        "Listen 60%, talk 40% in discovery",
        "Pain is only real when customer says it, not when you assume it",
      ],
      practiceExercise: "Write 5 situation questions for your next sales call",
      nextLesson: "Day 2: Problem Questions - Making Pain Explicit",
    },
  };

  return json(activeCourse);
};
