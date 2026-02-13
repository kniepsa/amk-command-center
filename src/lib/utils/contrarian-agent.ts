// Contrarian Agent - Generates opposite perspectives on decisions
// Helps avoid groupthink and unexamined assumptions

export interface ContrarianView {
  claim: string; // What you said
  opposite: string; // The contrarian view
  evidence: string[]; // Why the opposite might be true
  probability: number; // 0-100 (how likely the contrarian view is correct)
  questions: string[]; // Questions to validate your view
}

/**
 * Extracts decision keywords from text
 */
function extractDecision(text: string): string | null {
  const lowerText = text.toLowerCase();

  // Decision patterns
  const decisionPatterns = [
    /(?:should|going to|decided to|will|must|need to|planning to)\s+([^.!?]+)/gi,
    /(?:accept|reject|take|choose|select)\s+([^.!?]+)/gi,
  ];

  for (const pattern of decisionPatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }

  return null;
}

/**
 * Analyzes text for key entities (people, companies, amounts)
 */
function extractEntities(text: string): {
  people: string[];
  companies: string[];
  amounts: string[];
  timeframes: string[];
} {
  const entities = {
    people: [] as string[],
    companies: [] as string[],
    amounts: [] as string[],
    timeframes: [] as string[],
  };

  // Extract @mentions
  const peopleMatches = text.match(/@[\w-]+/g);
  if (peopleMatches) {
    entities.people = peopleMatches.map((m) => m.substring(1));
  }

  // Extract amounts (R, €, $)
  const amountMatches = text.match(/[R€$]\s*[\d,.]+[MKmk]?/g);
  if (amountMatches) {
    entities.amounts = amountMatches;
  }

  // Extract timeframes
  const timeMatches = text.match(/\d+\s*(days?|weeks?|months?|years?)/gi);
  if (timeMatches) {
    entities.timeframes = timeMatches;
  }

  return entities;
}

/**
 * Generates contrarian evidence based on decision context
 */
function generateEvidence(
  decision: string,
  reasoning: string,
  entities: ReturnType<typeof extractEntities>,
): string[] {
  const evidence: string[] = [];
  const lowerDecision = decision.toLowerCase();
  const lowerReasoning = reasoning.toLowerCase();

  // Partnership/investment decisions
  if (
    lowerDecision.includes("partnership") ||
    lowerDecision.includes("invest") ||
    lowerDecision.includes("deal")
  ) {
    if (entities.timeframes.some((t) => t.includes("year"))) {
      evidence.push(
        `${entities.timeframes[0]} commitment locks you in - what if circumstances change?`,
      );
    }

    if (entities.amounts.length > 0) {
      evidence.push(
        `Cash now (${entities.amounts[0]}) > uncertain future value - time value of money`,
      );
    }

    if (
      lowerReasoning.includes("potential") ||
      lowerReasoning.includes("could")
    ) {
      evidence.push(
        "'Potential' and 'could' are optimism bias - what's the base rate?",
      );
    }
  }

  // Accept/reject decisions
  if (lowerDecision.includes("accept")) {
    evidence.push(
      "Accepting = giving up optionality - can you negotiate better terms?",
    );
    evidence.push(
      "First offer is rarely the best offer - have you explored alternatives?",
    );
  }

  if (lowerDecision.includes("reject")) {
    evidence.push(
      "Rejecting = closing door permanently - is there room to negotiate?",
    );
    evidence.push("What's the opportunity cost of walking away?");
  }

  // Exit/sale decisions
  if (
    lowerDecision.includes("exit") ||
    lowerDecision.includes("sell") ||
    lowerDecision.includes("sell")
  ) {
    if (lowerReasoning.includes("wife") || lowerReasoning.includes("family")) {
      evidence.push(
        "Family pressure is valid, but rushed exits leave money on the table",
      );
    }

    if (entities.timeframes.some((t) => t.toLowerCase().includes("days"))) {
      evidence.push(
        `${entities.timeframes[0]} timeline creates urgency - urgency favors buyer, not seller`,
      );
    }
  }

  // Build/buy decisions
  if (lowerDecision.includes("build") || lowerDecision.includes("buy")) {
    if (lowerDecision.includes("build")) {
      evidence.push(
        "Build = control, but 3x time + cost overruns are the norm",
      );
      evidence.push("Buy = faster, but vendor lock-in and integration pain");
    }
  }

  // Default evidence if nothing specific
  if (evidence.length === 0) {
    evidence.push("Current decision based on incomplete information");
    evidence.push("Status quo bias may be influencing this choice");
    evidence.push("What would a completely rational outsider choose?");
  }

  return evidence.slice(0, 5); // Max 5 evidence points
}

/**
 * Generates challenging questions
 */
function generateQuestions(
  decision: string,
  reasoning: string,
  entities: ReturnType<typeof extractEntities>,
): string[] {
  const questions: string[] = [];
  const lowerDecision = decision.toLowerCase();
  const lowerReasoning = reasoning.toLowerCase();

  // Timeline questions
  if (entities.timeframes.length > 0) {
    questions.push(
      `Can you really commit ${entities.timeframes[0]}? Be brutally honest.`,
    );
  }

  // People questions
  if (entities.people.length > 0) {
    questions.push(
      `Have you validated this with ${entities.people[0]} directly, or are you assuming?`,
    );
  }

  // Amount questions
  if (entities.amounts.length > 1) {
    questions.push(
      `Is ${entities.amounts[0]} premium over ${entities.amounts[1]} worth the trade-offs?`,
    );
  }

  // Partnership questions
  if (lowerDecision.includes("partnership")) {
    questions.push(
      "What if the partnership fails in Year 2? What's your exit?",
    );
    questions.push("Do you have control, or just influence? Be specific.");
  }

  // Sale/exit questions
  if (lowerDecision.includes("sell") || lowerDecision.includes("exit")) {
    questions.push("What's the best alternative if this deal falls through?");
    questions.push(
      "Are you selling because it's right, or because you're tired?",
    );
  }

  // Investment questions
  if (lowerDecision.includes("invest")) {
    questions.push(
      "What's your expected ROI? Have you run the math conservatively?",
    );
    questions.push(
      "What could go wrong that would make this a bad investment?",
    );
  }

  // Opportunity cost
  questions.push("What else could you do with this time/money/energy?");

  // Pre-mortem
  questions.push(
    "It's 12 months from now and this decision failed. What happened?",
  );

  return questions.slice(0, 6); // Max 6 questions
}

/**
 * Calculates probability that contrarian view is correct
 * Based on strength of reasoning and decision context
 */
function calculateProbability(
  decision: string,
  reasoning: string,
  evidence: string[],
): number {
  let probability = 30; // Base: 30% (contrarian view has merit by default)

  const lowerReasoning = reasoning.toLowerCase();

  // Increase probability for weak reasoning
  const weakSignals = [
    "potential",
    "could",
    "might",
    "maybe",
    "hopefully",
    "probably",
    "should",
  ];
  const weakCount = weakSignals.filter((s) =>
    lowerReasoning.includes(s),
  ).length;
  probability += weakCount * 5; // +5% per weak signal

  // Increase probability for emotional reasoning
  const emotionalSignals = [
    "excited",
    "feel",
    "want",
    "hope",
    "scared",
    "worried",
  ];
  const emotionalCount = emotionalSignals.filter((s) =>
    lowerReasoning.includes(s),
  ).length;
  probability += emotionalCount * 8; // +8% per emotional signal

  // Increase probability for time pressure
  if (
    lowerReasoning.includes("urgent") ||
    lowerReasoning.includes("rush") ||
    lowerReasoning.includes("asap")
  ) {
    probability += 15;
  }

  // Increase probability for lack of alternatives mentioned
  if (
    !lowerReasoning.includes("alternative") &&
    !lowerReasoning.includes("option")
  ) {
    probability += 10;
  }

  // Cap at 85% (contrarian view is rarely >85% correct if you've thought about it)
  return Math.min(probability, 85);
}

/**
 * Generates a contrarian view for a decision
 */
export function generateContrarianView(
  decision: string,
  reasoning: string,
): ContrarianView | null {
  // Extract decision from text if not explicit
  const actualDecision = extractDecision(decision) || decision;

  if (!actualDecision) {
    return null;
  }

  // Extract entities
  const entities = extractEntities(decision + " " + reasoning);

  // Generate opposite claim
  let opposite = actualDecision;

  // Simple negation rules
  if (actualDecision.toLowerCase().includes("accept")) {
    opposite = actualDecision.replace(/accept/gi, "reject");
  } else if (actualDecision.toLowerCase().includes("reject")) {
    opposite = actualDecision.replace(/reject/gi, "accept");
  } else if (actualDecision.toLowerCase().includes("sell")) {
    opposite = actualDecision.replace(/sell/gi, "hold onto");
  } else if (actualDecision.toLowerCase().includes("buy")) {
    opposite = actualDecision.replace(/buy/gi, "build instead of buying");
  } else if (actualDecision.toLowerCase().includes("partner")) {
    opposite = actualDecision.replace(
      /partner/gi,
      "exit cleanly without partnering",
    );
  } else {
    // Generic negation
    opposite = `Don't ${actualDecision.toLowerCase()}`;
  }

  const evidence = generateEvidence(actualDecision, reasoning, entities);
  const questions = generateQuestions(actualDecision, reasoning, entities);
  const probability = calculateProbability(actualDecision, reasoning, evidence);

  return {
    claim: actualDecision,
    opposite,
    evidence,
    probability,
    questions,
  };
}

/**
 * Analyzes multiple decisions and returns contrarian views
 */
export function analyzeDecisions(
  text: string,
): { decision: string; contrarian: ContrarianView }[] {
  const results: { decision: string; contrarian: ContrarianView }[] = [];

  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  for (const sentence of sentences) {
    const decision = extractDecision(sentence);
    if (decision) {
      // Use surrounding sentences for reasoning
      const sentenceIndex = sentences.indexOf(sentence);
      const context = sentences.slice(
        Math.max(0, sentenceIndex - 1),
        Math.min(sentences.length, sentenceIndex + 2),
      );
      const reasoning = context.join(". ");

      const contrarian = generateContrarianView(decision, reasoning);
      if (contrarian) {
        results.push({ decision, contrarian });
      }
    }
  }

  return results;
}
