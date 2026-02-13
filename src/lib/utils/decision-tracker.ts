import { browser } from "$app/environment";

/**
 * Decision Journal - Track high-stakes decisions and learn from outcomes
 * Based on decision journaling best practices for entrepreneurs
 */

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Decision {
  id: string;
  date: string; // YYYY-MM-DD
  decision: string; // "Accept Leon R25M hybrid structure"
  optionsConsidered: string[]; // ["Colin R16M cash", "Leon R25M hybrid", "Wait for other buyers"]
  reasoning: string; // "Leon's partnership potential + vertical integration"
  assumptions: string[]; // ["TechTulu minorities will exit", "Leon committed 3-5 years"]
  riskLevel: RiskLevel;
  confidence: number; // 0-10
  reviewDates: ReviewDate[];
  outcome?: DecisionOutcome;
  tags?: string[]; // ["m&a", "printulu", "partnership"]
}

export interface ReviewDate {
  date: string; // YYYY-MM-DD
  reviewed: boolean;
}

export interface DecisionOutcome {
  date: string; // YYYY-MM-DD
  actualResult: string;
  assumptionsCorrect: boolean[];
  learnings: string[];
  accuracyScore: number; // 0-100
}

const STORAGE_KEY = "amk-decisions";

/**
 * Generate review dates (30, 90, 180, 365 days from decision)
 */
function generateReviewDates(decisionDate: string): ReviewDate[] {
  const date = new Date(decisionDate);
  const intervals = [30, 90, 180, 365]; // days

  return intervals.map((days) => {
    const reviewDate = new Date(date);
    reviewDate.setDate(reviewDate.getDate() + days);
    return {
      date: reviewDate.toISOString().split("T")[0],
      reviewed: false,
    };
  });
}

/**
 * Load decisions from localStorage
 */
function loadDecisions(): Decision[] {
  if (!browser) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (error) {
    console.error("Failed to load decisions:", error);
    return [];
  }
}

/**
 * Save decisions to localStorage
 */
function saveDecisions(decisions: Decision[]): void {
  if (!browser) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions, null, 2));
  } catch (error) {
    console.error("Failed to save decisions:", error);
  }
}

/**
 * Create a new decision
 */
export function saveDecision(
  decision: Omit<Decision, "id" | "reviewDates">,
): void {
  const decisions = loadDecisions();

  const newDecision: Decision = {
    ...decision,
    id: crypto.randomUUID(),
    reviewDates: generateReviewDates(decision.date),
  };

  decisions.push(newDecision);
  saveDecisions(decisions);
}

/**
 * Get all decisions (sorted newest first)
 */
export function getAllDecisions(): Decision[] {
  return loadDecisions().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

/**
 * Get decisions due for review (within 7 days of any review date)
 */
export function getDecisionsDueForReview(): Decision[] {
  const decisions = loadDecisions();
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  return decisions.filter((decision) => {
    return decision.reviewDates.some((review) => {
      if (review.reviewed) return false;

      const reviewDate = new Date(review.date);
      return reviewDate >= today && reviewDate <= sevenDaysFromNow;
    });
  });
}

/**
 * Update decision outcome
 */
export function updateDecisionOutcome(
  id: string,
  outcome: DecisionOutcome,
): void {
  const decisions = loadDecisions();
  const index = decisions.findIndex((d) => d.id === id);

  if (index === -1) {
    console.error(`Decision not found: ${id}`);
    return;
  }

  decisions[index].outcome = outcome;

  // Mark the closest review date as reviewed
  const outcomeDate = new Date(outcome.date);
  let closestReviewIndex = -1;
  let minDiff = Infinity;

  decisions[index].reviewDates.forEach((review, idx) => {
    const reviewDate = new Date(review.date);
    const diff = Math.abs(reviewDate.getTime() - outcomeDate.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closestReviewIndex = idx;
    }
  });

  if (closestReviewIndex !== -1) {
    decisions[index].reviewDates[closestReviewIndex].reviewed = true;
  }

  saveDecisions(decisions);
}

/**
 * Mark a review date as completed (without adding outcome)
 */
export function markReviewCompleted(
  decisionId: string,
  reviewDateStr: string,
): void {
  const decisions = loadDecisions();
  const decision = decisions.find((d) => d.id === decisionId);

  if (!decision) return;

  const review = decision.reviewDates.find((r) => r.date === reviewDateStr);
  if (review) {
    review.reviewed = true;
    saveDecisions(decisions);
  }
}

/**
 * Get decision accuracy statistics
 */
export function getDecisionAccuracy(): {
  total: number;
  avg: number;
  byRisk: Record<RiskLevel, { count: number; avg: number }>;
} {
  const decisions = loadDecisions();
  const withOutcomes = decisions.filter((d) => d.outcome !== undefined);

  if (withOutcomes.length === 0) {
    return {
      total: 0,
      avg: 0,
      byRisk: {
        low: { count: 0, avg: 0 },
        medium: { count: 0, avg: 0 },
        high: { count: 0, avg: 0 },
        critical: { count: 0, avg: 0 },
      },
    };
  }

  const totalScore = withOutcomes.reduce(
    (sum, d) => sum + (d.outcome?.accuracyScore ?? 0),
    0,
  );
  const avgScore = totalScore / withOutcomes.length;

  // Calculate by risk level
  const byRisk: Record<RiskLevel, { count: number; avg: number }> = {
    low: { count: 0, avg: 0 },
    medium: { count: 0, avg: 0 },
    high: { count: 0, avg: 0 },
    critical: { count: 0, avg: 0 },
  };

  Object.keys(byRisk).forEach((risk) => {
    const riskDecisions = withOutcomes.filter((d) => d.riskLevel === risk);
    if (riskDecisions.length > 0) {
      const riskScore = riskDecisions.reduce(
        (sum, d) => sum + (d.outcome?.accuracyScore ?? 0),
        0,
      );
      byRisk[risk as RiskLevel] = {
        count: riskDecisions.length,
        avg: riskScore / riskDecisions.length,
      };
    }
  });

  return {
    total: withOutcomes.length,
    avg: avgScore,
    byRisk,
  };
}

/**
 * Delete a decision
 */
export function deleteDecision(id: string): void {
  const decisions = loadDecisions();
  const filtered = decisions.filter((d) => d.id !== id);
  saveDecisions(filtered);
}

/**
 * Export decisions to markdown
 */
export function exportToMarkdown(): string {
  const decisions = getAllDecisions();

  let markdown = "# Decision Journal\n\n";
  markdown += `Exported: ${new Date().toISOString().split("T")[0]}\n\n`;
  markdown += `Total Decisions: ${decisions.length}\n\n`;

  const stats = getDecisionAccuracy();
  if (stats.total > 0) {
    markdown += `## Accuracy Stats\n\n`;
    markdown += `- Average Accuracy: ${stats.avg.toFixed(1)}%\n`;
    markdown += `- Decisions Reviewed: ${stats.total}\n\n`;
  }

  markdown += `---\n\n`;

  decisions.forEach((decision) => {
    markdown += `## ${decision.decision}\n\n`;
    markdown += `**Date**: ${decision.date}  \n`;
    markdown += `**Risk Level**: ${decision.riskLevel}  \n`;
    markdown += `**Confidence**: ${decision.confidence}/10\n\n`;

    if (decision.optionsConsidered.length > 0) {
      markdown += `**Options Considered**:\n`;
      decision.optionsConsidered.forEach((opt) => {
        markdown += `- ${opt}\n`;
      });
      markdown += `\n`;
    }

    markdown += `**Reasoning**: ${decision.reasoning}\n\n`;

    if (decision.assumptions.length > 0) {
      markdown += `**Assumptions**:\n`;
      decision.assumptions.forEach((assumption) => {
        markdown += `- ${assumption}\n`;
      });
      markdown += `\n`;
    }

    if (decision.outcome) {
      markdown += `### Outcome (${decision.outcome.date})\n\n`;
      markdown += `**Accuracy Score**: ${decision.outcome.accuracyScore}%\n\n`;
      markdown += `**Result**: ${decision.outcome.actualResult}\n\n`;

      if (decision.outcome.learnings.length > 0) {
        markdown += `**Learnings**:\n`;
        decision.outcome.learnings.forEach((learning) => {
          markdown += `- ${learning}\n`;
        });
        markdown += `\n`;
      }
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * Detect decision language in voice input
 */
export function detectDecisionLanguage(text: string): boolean {
  const patterns = [
    /i've decided to/i,
    /going with/i,
    /choosing/i,
    /decided on/i,
    /picked/i,
    /selected/i,
    /accepted.*offer/i,
    /rejected.*offer/i,
    /will go ahead with/i,
  ];

  return patterns.some((pattern) => pattern.test(text));
}
