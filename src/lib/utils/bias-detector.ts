// Bias detection for decision-making
// Catches common cognitive biases in journal entries and decisions

export type BiasType =
  | "sunk-cost"
  | "confirmation"
  | "anchoring"
  | "availability"
  | "optimism"
  | "loss-aversion";

export type BiasSeverity = "low" | "medium" | "high";

export interface BiasDetection {
  type: BiasType;
  severity: BiasSeverity;
  evidence: string; // The phrase that triggered detection
  explanation: string;
  challenge: string; // Question to ask yourself
  icon: string;
}

interface BiasPattern {
  triggers: string[];
  explanation: string;
  challenge: string;
  icon: string;
}

const BIAS_PATTERNS: Record<BiasType, BiasPattern> = {
  "sunk-cost": {
    triggers: [
      "already invested",
      "already spent",
      "too far in",
      "can't give up now",
      "wasted if I stop",
      "put so much into",
      "committed so much",
      "gone this far",
    ],
    explanation:
      "Sunk Cost Fallacy: Past investment shouldn't dictate future decisions",
    challenge:
      "If you were starting fresh today, would you make this same choice?",
    icon: "💸",
  },
  confirmation: {
    triggers: [
      "everyone says",
      "all the data shows",
      "obviously",
      "clearly",
      "of course",
      "no doubt",
      "without question",
      "everyone agrees",
    ],
    explanation:
      "Confirmation Bias: Seeking info that confirms existing beliefs",
    challenge: "What evidence would prove you wrong? Have you looked for it?",
    icon: "🔍",
  },
  anchoring: {
    triggers: [
      "originally wanted",
      "started at",
      "compared to",
      "they said",
      "first offer was",
      "initial price",
      "was hoping for",
    ],
    explanation:
      "Anchoring Bias: First number influences all subsequent judgments",
    challenge:
      "Ignore the anchor. What's the true value based on fundamentals?",
    icon: "⚓",
  },
  availability: {
    triggers: [
      "just saw",
      "recently happened",
      "last time",
      "everyone's talking about",
      "saw on twitter",
      "read an article",
      "heard about",
    ],
    explanation: "Availability Bias: Recent/dramatic events feel more probable",
    challenge:
      "Is this actually common, or just memorable? Check the base rates.",
    icon: "📰",
  },
  optimism: {
    triggers: [
      "definitely will",
      "can't fail",
      "guaranteed",
      "easy to",
      "no problem",
      "piece of cake",
      "simple as that",
      "nothing can go wrong",
    ],
    explanation:
      "Optimism Bias: Overestimating likelihood of positive outcomes",
    challenge: "What could go wrong? Run a pre-mortem.",
    icon: "😎",
  },
  "loss-aversion": {
    triggers: [
      "don't want to lose",
      "scared of missing out",
      "what if I regret",
      "afraid to lose",
      "can't afford to miss",
      "fomo",
      "might never get another chance",
    ],
    explanation: "Loss Aversion: Fear of loss outweighs potential gain",
    challenge:
      "What's the upside if you DO take the risk? Compare objectively.",
    icon: "😰",
  },
};

/**
 * Calculates severity based on multiple factors:
 * - Multiple trigger words = higher severity
 * - Specific high-risk patterns = automatic high severity
 * - Context around decision-making keywords
 */
function calculateSeverity(
  text: string,
  evidence: string,
  biasType: BiasType,
): BiasSeverity {
  const lowerText = text.toLowerCase();

  // High severity indicators
  const highSeverityPatterns = [
    /can't (give up|stop|quit) now/i,
    /already (invested|spent) \d+/i, // Mentions specific amounts
    /definitely (will|going to)/i,
    /guaranteed/i,
    /can't fail/i,
  ];

  if (highSeverityPatterns.some((pattern) => pattern.test(text))) {
    return "high";
  }

  // Check for decision-making context
  const decisionKeywords = [
    "should I",
    "going to",
    "decided to",
    "planning to",
    "will",
    "must",
    "need to",
  ];
  const hasDecisionContext = decisionKeywords.some((keyword) =>
    lowerText.includes(keyword),
  );

  // Medium severity: Multiple triggers + decision context
  const triggerCount = BIAS_PATTERNS[biasType].triggers.filter((trigger) =>
    lowerText.includes(trigger.toLowerCase()),
  ).length;

  if (triggerCount >= 2 && hasDecisionContext) {
    return "medium";
  }

  if (triggerCount >= 2 || hasDecisionContext) {
    return "medium";
  }

  return "low";
}

/**
 * Detects cognitive biases in text
 */
export function detectBiases(text: string): BiasDetection[] {
  const detections: BiasDetection[] = [];
  const lowerText = text.toLowerCase();

  // Check each bias type
  for (const [biasType, pattern] of Object.entries(BIAS_PATTERNS)) {
    const matchedTriggers: string[] = [];

    // Find all matching triggers
    for (const trigger of pattern.triggers) {
      if (lowerText.includes(trigger.toLowerCase())) {
        matchedTriggers.push(trigger);
      }
    }

    // If any triggers matched, create detection
    if (matchedTriggers.length > 0) {
      // Find the actual evidence in the original text (preserve case)
      const evidenceMatches: string[] = [];
      for (const trigger of matchedTriggers) {
        const regex = new RegExp(`[^.!?]*${trigger}[^.!?]*[.!?]`, "gi");
        const matches = text.match(regex);
        if (matches) {
          evidenceMatches.push(...matches);
        }
      }

      const evidence =
        evidenceMatches.length > 0
          ? evidenceMatches[0].trim()
          : `Contains: ${matchedTriggers.join(", ")}`;

      const severity = calculateSeverity(text, evidence, biasType as BiasType);

      detections.push({
        type: biasType as BiasType,
        severity,
        evidence,
        explanation: pattern.explanation,
        challenge: pattern.challenge,
        icon: pattern.icon,
      });
    }
  }

  // Sort by severity (high -> medium -> low)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  detections.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  return detections;
}

/**
 * Get a summary of biases detected
 */
export function getBiasSummary(detections: BiasDetection[]): {
  total: number;
  high: number;
  medium: number;
  low: number;
  mostCommon: BiasType | null;
} {
  const summary = {
    total: detections.length,
    high: detections.filter((d) => d.severity === "high").length,
    medium: detections.filter((d) => d.severity === "medium").length,
    low: detections.filter((d) => d.severity === "low").length,
    mostCommon: null as BiasType | null,
  };

  // Find most common bias type
  if (detections.length > 0) {
    const typeCounts = detections.reduce(
      (acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      },
      {} as Record<BiasType, number>,
    );

    const mostCommonEntry = Object.entries(typeCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];
    summary.mostCommon = mostCommonEntry[0] as BiasType;
  }

  return summary;
}
