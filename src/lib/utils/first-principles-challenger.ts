// First Principles Challenger - Challenges assumptions to get to fundamental truths
// "Question everything" approach to decision-making

export interface FirstPrinciplesChallenge {
  assumption: string;
  fundamentalTruth: string | null; // Is this actually true?
  reasoning: string; // Why this assumption might be false
  alternatives: string[]; // What else could be true?
}

/**
 * Common assumption patterns to challenge
 */
const ASSUMPTION_PATTERNS = [
  {
    trigger: /(?:need to|have to|must)\s+([^.!?]+)/gi,
    type: "necessity",
    question: "Do you really NEED to {action}? What's the fundamental goal?",
  },
  {
    trigger:
      /(?:everyone|everyone does|everyone says|everyone thinks)\s+([^.!?]+)/gi,
    type: "social-proof",
    question: "Why does everyone {action}? Is there a better way?",
  },
  {
    trigger:
      /(?:it has to be|it must be|only way is|can't work unless)\s+([^.!?]+)/gi,
    type: "constraint",
    question:
      "Why does it have to be {constraint}? What constraints are real vs imagined?",
  },
  {
    trigger: /(?:always|never|every time|without exception)\s+([^.!?]+)/gi,
    type: "absolute",
    question: "Is this ALWAYS true? What are the exceptions?",
  },
  {
    trigger: /(?:supposed to|should|ought to)\s+([^.!?]+)/gi,
    type: "obligation",
    question:
      "Who says you should {action}? Is this your goal or someone else's?",
  },
  {
    trigger: /(?:can't|cannot|impossible to|won't work)\s+([^.!?]+)/gi,
    type: "limitation",
    question: "Why is {action} impossible? What would make it possible?",
  },
  {
    trigger: /(?:because|since|due to|as a result of)\s+([^.!?]+)/gi,
    type: "causation",
    question: "Is {reason} really the cause? What else could explain this?",
  },
];

/**
 * Extracts assumptions from text
 */
function extractAssumptions(text: string): {
  assumption: string;
  type: string;
  context: string;
}[] {
  const assumptions: { assumption: string; type: string; context: string }[] =
    [];

  for (const pattern of ASSUMPTION_PATTERNS) {
    const matches = [...text.matchAll(pattern.trigger)];

    for (const match of matches) {
      // Find the sentence containing this match
      const sentences = text.split(/[.!?]+/);
      const sentence = sentences.find((s) => s.includes(match[0]));

      if (sentence) {
        assumptions.push({
          assumption: match[0].trim(),
          type: pattern.type,
          context: sentence.trim(),
        });
      }
    }
  }

  return assumptions;
}

/**
 * Challenges a "necessity" assumption (need to, must, have to)
 */
function challengeNecessity(assumption: string, context: string): string[] {
  const alternatives: string[] = [];

  // Extract the action
  const actionMatch =
    assumption.match(/(?:need to|have to|must)\s+(.+)/i)?.[1] || assumption;

  alternatives.push(
    `Instead of "${actionMatch}", what's the actual outcome you want?`,
  );
  alternatives.push(`Can you achieve the same goal by NOT ${actionMatch}?`);
  alternatives.push(`What would happen if you simply didn't ${actionMatch}?`);

  return alternatives;
}

/**
 * Challenges a "social proof" assumption (everyone does X)
 */
function challengeSocialProof(assumption: string, context: string): string[] {
  const alternatives: string[] = [];

  const actionMatch = assumption.match(/everyone\s+(.+)/i)?.[1] || assumption;

  alternatives.push(
    `Why does everyone ${actionMatch}? Is it actually effective?`,
  );
  alternatives.push(
    `What if "everyone" is wrong? Has anyone tried NOT ${actionMatch}?`,
  );
  alternatives.push(`Who doesn't ${actionMatch}, and what do they do instead?`);

  return alternatives;
}

/**
 * Challenges a "constraint" assumption (has to be X)
 */
function challengeConstraint(assumption: string, context: string): string[] {
  const alternatives: string[] = [];

  const constraintMatch =
    assumption.match(/(?:has to be|must be|only way is)\s+(.+)/i)?.[1] ||
    assumption;

  alternatives.push(`Why does it have to be ${constraintMatch}? Says who?`);
  alternatives.push(
    `What if ${constraintMatch} is negotiable? Can you change it?`,
  );
  alternatives.push(
    `If you removed the constraint "${constraintMatch}", what becomes possible?`,
  );

  return alternatives;
}

/**
 * Challenges an "absolute" assumption (always, never)
 */
function challengeAbsolute(assumption: string, context: string): string[] {
  const alternatives: string[] = [];

  if (assumption.toLowerCase().includes("always")) {
    alternatives.push("Is this ALWAYS true, or just usually true?");
    alternatives.push("What are the exceptions? When doesn't this hold?");
    alternatives.push("Can you make an exception in this specific case?");
  } else if (assumption.toLowerCase().includes("never")) {
    alternatives.push("Has this NEVER happened, or just rarely?");
    alternatives.push("What would need to change for this to happen?");
    alternatives.push("Is this a rule, or just a pattern?");
  }

  return alternatives;
}

/**
 * Challenges an "obligation" assumption (should, supposed to)
 */
function challengeObligation(assumption: string, context: string): string[] {
  const alternatives: string[] = [];

  const actionMatch =
    assumption.match(/(?:supposed to|should|ought to)\s+(.+)/i)?.[1] ||
    assumption;

  alternatives.push(`Who says you should ${actionMatch}? Is this your goal?`);
  alternatives.push(
    `What happens if you DON'T ${actionMatch}? Is that actually bad?`,
  );
  alternatives.push(
    `Is ${actionMatch} the right goal, or just the expected goal?`,
  );

  return alternatives;
}

/**
 * Challenges a "limitation" assumption (can't, impossible)
 */
function challengeLimitation(assumption: string, context: string): string[] {
  const alternatives: string[] = [];

  const actionMatch =
    assumption.match(/(?:can't|cannot|impossible to)\s+(.+)/i)?.[1] ||
    assumption;

  alternatives.push(
    `Why is ${actionMatch} impossible? What's actually blocking it?`,
  );
  alternatives.push(`Has anyone else done ${actionMatch}? How?`);
  alternatives.push(
    `If you had unlimited resources, could you ${actionMatch}? What's the real constraint?`,
  );

  return alternatives;
}

/**
 * Challenges a "causation" assumption (because X, therefore Y)
 */
function challengeCausation(assumption: string, context: string): string[] {
  const alternatives: string[] = [];

  const reasonMatch =
    assumption.match(/(?:because|since|due to)\s+(.+)/i)?.[1] || assumption;

  alternatives.push(
    `Is "${reasonMatch}" really the cause, or just correlation?`,
  );
  alternatives.push(`What else could explain this? List 3 alternative causes.`);
  alternatives.push(
    `If "${reasonMatch}" changed, would the outcome actually change?`,
  );

  return alternatives;
}

/**
 * Generates a fundamental truth analysis
 */
function analyzeFundamentalTruth(
  assumption: string,
  type: string,
  context: string,
): string | null {
  const lowerAssumption = assumption.toLowerCase();

  // Check for common false assumptions
  if (type === "necessity") {
    if (
      lowerAssumption.includes("need to sell") ||
      lowerAssumption.includes("must exit")
    ) {
      return "Truth: You WANT to exit (emotional), but you don't NEED to (practical). Desire ≠ Necessity.";
    }
  }

  if (type === "social-proof") {
    return "Truth: Popularity ≠ Correctness. Most people follow conventions without questioning them.";
  }

  if (type === "constraint") {
    if (
      lowerAssumption.includes("price") ||
      lowerAssumption.includes("valuation")
    ) {
      return "Truth: All prices are negotiable. Constraints are starting points, not absolutes.";
    }
  }

  if (type === "absolute") {
    return "Truth: Absolutes (always/never) are rarely true in business. Context matters.";
  }

  if (type === "limitation") {
    return "Truth: Most 'impossible' things are actually just expensive or hard. Resource problem, not impossibility.";
  }

  if (type === "causation") {
    return "Truth: Correlation ≠ Causation. Multiple factors usually contribute to outcomes.";
  }

  return null;
}

/**
 * Main function: Challenges assumptions in text
 */
export function challengeAssumptions(text: string): FirstPrinciplesChallenge[] {
  const assumptions = extractAssumptions(text);
  const challenges: FirstPrinciplesChallenge[] = [];

  for (const { assumption, type, context } of assumptions) {
    let alternatives: string[] = [];
    let reasoning = "";

    switch (type) {
      case "necessity":
        alternatives = challengeNecessity(assumption, context);
        reasoning =
          "Necessity assumptions often confuse 'want' with 'need'. Strip away the should/must and ask: what's the actual goal?";
        break;

      case "social-proof":
        alternatives = challengeSocialProof(assumption, context);
        reasoning =
          "Social proof is often just herd behavior. Just because everyone does X doesn't mean X is optimal.";
        break;

      case "constraint":
        alternatives = challengeConstraint(assumption, context);
        reasoning =
          "Constraints are often self-imposed or negotiable. Question whether they're real or imagined.";
        break;

      case "absolute":
        alternatives = challengeAbsolute(assumption, context);
        reasoning =
          "Absolutes (always/never) are red flags. Reality is usually more nuanced than black-and-white.";
        break;

      case "obligation":
        alternatives = challengeObligation(assumption, context);
        reasoning =
          "Obligations often come from others' expectations, not your goals. Whose goal is this really?";
        break;

      case "limitation":
        alternatives = challengeLimitation(assumption, context);
        reasoning =
          "Limitations are often resource constraints disguised as impossibilities. What would it take to make this possible?";
        break;

      case "causation":
        alternatives = challengeCausation(assumption, context);
        reasoning =
          "Causation assumptions skip over alternative explanations. What else could explain this?";
        break;
    }

    const fundamentalTruth = analyzeFundamentalTruth(assumption, type, context);

    challenges.push({
      assumption: context, // Use full context for clarity
      fundamentalTruth,
      reasoning,
      alternatives: alternatives.slice(0, 3), // Max 3 alternatives
    });
  }

  return challenges;
}

/**
 * Gets a summary of challenged assumptions
 */
export function getChallengeSummary(challenges: FirstPrinciplesChallenge[]): {
  total: number;
  byType: Record<string, number>;
  mostChallenged: string | null;
} {
  const summary = {
    total: challenges.length,
    byType: {} as Record<string, number>,
    mostChallenged: null as string | null,
  };

  // Count by type (extract from reasoning)
  for (const challenge of challenges) {
    if (challenge.reasoning.includes("Necessity")) {
      summary.byType["necessity"] = (summary.byType["necessity"] || 0) + 1;
    } else if (challenge.reasoning.includes("Social proof")) {
      summary.byType["social-proof"] =
        (summary.byType["social-proof"] || 0) + 1;
    } else if (challenge.reasoning.includes("Constraint")) {
      summary.byType["constraint"] = (summary.byType["constraint"] || 0) + 1;
    }
  }

  // Find most challenged type
  if (Object.keys(summary.byType).length > 0) {
    const mostCommonEntry = Object.entries(summary.byType).sort(
      (a, b) => b[1] - a[1],
    )[0];
    summary.mostChallenged = mostCommonEntry[0];
  }

  return summary;
}
