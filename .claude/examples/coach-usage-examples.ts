/**
 * AI Coach System - Usage Examples
 *
 * This file demonstrates how to integrate the coach system
 * into the Command Center V2 chat interface.
 */

import type { CoachChallenge, CoachesConfig } from "$lib/types/coach";
import { getCoach, getAllCoaches } from "$lib/coaches";

// ============================================================================
// Example 1: Loading User Coach Preferences
// ============================================================================

export async function loadUserCoachPreferences(): Promise<CoachesConfig> {
  const response = await fetch("/api/coaches/config");

  if (!response.ok) {
    throw new Error("Failed to load coach preferences");
  }

  return await response.json();
}

// ============================================================================
// Example 2: Detecting Triggers in User Input
// ============================================================================

export function detectCoachTriggers(
  userInput: string,
  coachesConfig: CoachesConfig,
): string[] {
  const activatedCoaches: string[] = [];
  const normalizedInput = userInput.toLowerCase();

  for (const coach of coachesConfig.active_coaches) {
    if (!coach.enabled || !coach.auto_activate) continue;

    // Check if any trigger keyword matches
    const hasMatch = coach.triggers.some((trigger) =>
      normalizedInput.includes(trigger.toLowerCase()),
    );

    if (hasMatch) {
      activatedCoaches.push(coach.id);
    }
  }

  return activatedCoaches;
}

// ============================================================================
// Example 3: Generating Coach Challenges
// ============================================================================

export async function generateCoachChallenges(
  userMessage: string,
  context: {
    recent_entries?: string[];
    active_threads?: string[];
  },
  activeCoaches: string[],
): Promise<CoachChallenge[]> {
  const response = await fetch("/api/coaches/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_message: userMessage,
      context,
      active_coaches: activeCoaches,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate coach challenges");
  }

  const data = await response.json();
  return data.challenges;
}

// ============================================================================
// Example 4: Complete Chat Flow with Coaches
// ============================================================================

export async function handleUserMessage(
  userMessage: string,
  coachesConfig: CoachesConfig,
): Promise<{
  response: string;
  challenges: CoachChallenge[];
}> {
  // 1. Detect which coaches should activate
  const activatedCoaches = detectCoachTriggers(userMessage, coachesConfig);

  // 2. Limit to max coaches per response
  const maxCoaches = coachesConfig.settings.max_coaches_per_response;
  const selectedCoaches = activatedCoaches.slice(0, maxCoaches);

  // 3. Get context (in real app, this would fetch from journal)
  const context = {
    recent_entries: [], // TODO: Fetch recent entries
    active_threads: [], // TODO: Fetch active threads
  };

  // 4. Generate coach challenges
  const challenges = await generateCoachChallenges(
    userMessage,
    context,
    selectedCoaches,
  );

  // 5. Generate main Claude response
  const mainResponse = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage, context }),
  });

  const { response } = await mainResponse.json();

  return { response, challenges };
}

// ============================================================================
// Example 5: Real-World Usage in Svelte Component
// ============================================================================

/**
 * Example Svelte component for chat interface
 */
export const ChatWithCoaches_Example = `
<script lang="ts">
  import { onMount } from 'svelte';
  import CoachChallenge from '$lib/components/CoachChallenge.svelte';
  import type { CoachChallenge, CoachesConfig } from '$lib/types/coach';

  let userInput = '';
  let messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  let challenges: CoachChallenge[] = [];
  let coachesConfig: CoachesConfig | null = null;

  onMount(async () => {
    coachesConfig = await loadUserCoachPreferences();
  });

  async function sendMessage() {
    if (!userInput.trim() || !coachesConfig) return;

    // Add user message
    messages = [...messages, { role: 'user', content: userInput }];
    const currentMessage = userInput;
    userInput = '';

    try {
      // Generate response with coach challenges
      const result = await handleUserMessage(currentMessage, coachesConfig);

      // Add assistant response
      messages = [...messages, { role: 'assistant', content: result.response }];

      // Show coach challenges
      challenges = result.challenges;
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  }

  function handleTellMeMore(challenge: CoachChallenge) {
    // Request deeper analysis from this coach
    userInput = \`Tell me more about what \${challenge.coach_name} said\`;
    sendMessage();
  }

  function handleIgnore(challenge: CoachChallenge) {
    // Remove this challenge
    challenges = challenges.filter(c => c.coach_id !== challenge.coach_id);
  }
</script>

<div class="chat-container">
  <!-- Messages -->
  <div class="messages">
    {#each messages as message}
      <div class="message" class:user={message.role === 'user'}>
        {message.content}
      </div>
    {/each}

    <!-- Coach Challenges -->
    {#if challenges.length > 0}
      <div class="coaches-section">
        {#each challenges as challenge}
          <CoachChallenge
            {challenge}
            onTellMeMore={() => handleTellMeMore(challenge)}
            onIgnore={() => handleIgnore(challenge)}
          />
        {/each}
      </div>
    {/if}
  </div>

  <!-- Input -->
  <div class="input-container">
    <input
      bind:value={userInput}
      on:keydown={(e) => e.key === 'Enter' && sendMessage()}
      placeholder="Type your message..."
    />
    <button on:click={sendMessage}>Send</button>
  </div>
</div>
`;

// ============================================================================
// Example 6: Specific Coach Scenarios
// ============================================================================

// Scenario: Leon Ghosting (Machiavelli + Bill Campbell)
export const leonGhostingExample = {
  input: "Leon hasn't responded to my WhatsApp. Should I call him?",
  expectedCoaches: ["machiavelli", "bill-campbell"],
  expectedChallenges: [
    {
      coach_id: "machiavelli",
      coach_name: "Machiavelli",
      icon: "🎭",
      message:
        "He went from 'for you anytime' to ghosting in 7 days. This is a power move. Don't chase—focus on Jerome and Abdul. Let Leon see he's losing exclusivity.",
      quote:
        "The Prince, Ch. 17: 'It is better to be feared than loved, if you cannot be both.'",
      confidence: 0.92,
    },
    {
      coach_id: "bill-campbell",
      coach_name: "Bill Campbell",
      icon: "📚",
      message:
        "Just call him. Seriously. 'Hey Leon, you said anytime—I took that seriously. 15 minutes Friday?' Direct beats games. If he respects you, he'll apologize and schedule.",
      confidence: 0.85,
    },
  ],
};

// Scenario: Parenting Issue (Parenting Guru)
export const parentingExample = {
  input: "@linus refusing to put on shoes again. Tantrum every morning.",
  expectedCoaches: ["parenting-guru"],
  expectedChallenges: [
    {
      coach_id: "parenting-guru",
      coach_name: "Parenting Guru",
      icon: "🧒",
      message:
        "This is developmentally normal for 4-year-olds—they're testing autonomy. Instead of forcing, offer choice: 'Red shoes or blue shoes?' Control the options, not the child. Repeat 10-20 times for habit formation.",
      quote:
        "Montessori Principle: Prepared environment makes good choices easy.",
      confidence: 0.88,
    },
  ],
};

// Scenario: Sales Pitch (Sales Coach)
export const salesPitchExample = {
  input:
    "Preparing pitch deck for Colin at Lithotech tomorrow. Want to nail it.",
  expectedCoaches: ["sales-coach", "ma-advisor"],
  expectedChallenges: [
    {
      coach_id: "sales-coach",
      coach_name: "Sales Coach (SPIN)",
      icon: "💼",
      message:
        "Before you pitch features, have you done discovery? Ask Colin: 'How much time do your 40-50 reps spend coordinating with suppliers vs selling?' Let HIM tell you the pain. Then show how the platform solves HIS problem—not yours.",
      confidence: 0.91,
    },
  ],
};

// Scenario: Strategic Decision (Peter Drucker + M&A Advisor)
export const strategicDecisionExample = {
  input: "Big decision: Accept Leon's R25M offer or wait for better deal?",
  expectedCoaches: ["peter-drucker", "ma-advisor"],
  expectedChallenges: [
    {
      coach_id: "peter-drucker",
      coach_name: "Peter Drucker",
      icon: "📊",
      message:
        "What's the ONE assumption that, if wrong, kills this decision? You're assuming: (1) Leon will close in 90 days, (2) No better buyer exists, (3) R25M is fair value. Which assumption is weakest? What's your evidence?",
      confidence: 0.87,
    },
    {
      coach_id: "ma-advisor",
      coach_name: "M&A Advisor",
      icon: "💰",
      message:
        "R25M on what EBITDA multiple? What's your BATNA (Best Alternative)? Run 3 scenarios: (1) Leon closes at R25M, (2) Leon stalls, you find backup buyer at R20M, (3) Market weakens, best offer is R15M. Which do you plan for?",
      confidence: 0.89,
    },
  ],
};

// ============================================================================
// Example 7: Testing Trigger Detection
// ============================================================================

export function testTriggerDetection() {
  const testCases = [
    {
      input: "Leon ghosted me",
      expected: ["machiavelli"],
      description: "Should activate Machiavelli on buyer ghosting",
    },
    {
      input: "@linus throwing tantrum",
      expected: ["parenting-guru"],
      description: "Should activate Parenting Guru on child behavior",
    },
    {
      input: "Feeling overwhelmed by deal timeline",
      expected: ["stoic-advisor"],
      description: "Should activate Stoic Advisor on anxiety",
    },
    {
      input: "@team conflict about roadmap priorities",
      expected: ["bill-campbell"],
      description: "Should activate Bill Campbell on team conflict",
    },
    {
      input: "Questioning my strategy assumptions",
      expected: ["peter-drucker"],
      description: "Should activate Peter Drucker on strategic thinking",
    },
  ];

  const mockConfig: CoachesConfig = {
    active_coaches: [
      {
        id: "machiavelli",
        name: "Machiavelli",
        enabled: true,
        challenge_level: "medium",
        triggers: ["ghosting", "Leon", "negotiation"],
        auto_activate: true,
      },
      {
        id: "parenting-guru",
        name: "Parenting Guru",
        enabled: true,
        challenge_level: "low",
        triggers: ["@linus", "tantrum", "@kinder"],
        auto_activate: true,
      },
      {
        id: "stoic-advisor",
        name: "Stoic Advisor",
        enabled: true,
        challenge_level: "low",
        triggers: ["overwhelmed", "anxiety", "stressed"],
        auto_activate: true,
      },
      {
        id: "bill-campbell",
        name: "Bill Campbell",
        enabled: true,
        challenge_level: "medium",
        triggers: ["@team", "conflict", "#leadership"],
        auto_activate: true,
      },
      {
        id: "peter-drucker",
        name: "Peter Drucker",
        enabled: true,
        challenge_level: "medium",
        triggers: ["strategy", "assumptions", "first principles"],
        auto_activate: true,
      },
    ],
    settings: {
      show_immediately: true,
      allow_debates: false,
      max_coaches_per_response: 2,
    },
  };

  console.log("Testing Coach Trigger Detection\n");

  for (const testCase of testCases) {
    const detected = detectCoachTriggers(testCase.input, mockConfig);
    const passed = detected.some((id) => testCase.expected.includes(id));

    console.log(`${passed ? "✅" : "❌"} ${testCase.description}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: ${testCase.expected.join(", ")}`);
    console.log(`   Detected: ${detected.join(", ") || "none"}`);
    console.log("");
  }
}

// ============================================================================
// Example 8: Challenge Level Demonstration
// ============================================================================

export const challengeLevelExamples = {
  low: {
    coach: "bill-campbell",
    message:
      "Consider being more direct with your team. Have you thought about having a one-on-one to share your concerns?",
  },
  medium: {
    coach: "bill-campbell",
    message:
      "Are you being direct enough? Or are you tiptoeing around the real issue? Your team needs to hear the truth—with care.",
  },
  high: {
    coach: "bill-campbell",
    message:
      "Stop tiptoeing. Call them RIGHT NOW. 'Hey, we need to talk about X. 15 minutes today?' Direct beats games. If they respect you, they'll schedule. If not, you learn fast.",
  },
};

// Run trigger detection tests (uncomment to test)
// testTriggerDetection();
