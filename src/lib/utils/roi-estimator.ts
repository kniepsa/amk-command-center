// ROI Estimator - Calculates value/cost for tasks
// Helps prioritize: Do Now | Delegate | Drop

export type ROIRecommendation = "do-now" | "do-later" | "delegate" | "drop";

export interface ROIEstimate {
  task: string;
  estimatedValue: number; // Dollars or hours saved (annual)
  estimatedCost: number; // Hours required
  roi: number; // Value / Cost
  paybackPeriod: string; // "2 weeks", "3 months"
  recommendation: ROIRecommendation;
  reasoning: string;
}

/**
 * Parses monetary values from text (R, €, $, M, K)
 */
function parseMonetaryValue(text: string): number | null {
  // Match patterns like: R25M, €500K, $1.5M
  const patterns = [
    /([R€$])\s*(\d+(?:\.\d+)?)\s*M/i, // R25M
    /([R€$])\s*(\d+(?:\.\d+)?)\s*K/i, // R500K
    /([R€$])\s*(\d+(?:,\d+)*(?:\.\d+)?)/i, // R25,000 or R25000
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[2].replace(/,/g, ""));

      if (text.includes("M")) {
        return amount * 1_000_000;
      } else if (text.includes("K")) {
        return amount * 1_000;
      } else {
        return amount;
      }
    }
  }

  return null;
}

/**
 * Estimates time savings from task
 */
function estimateTimeSavings(task: string): number {
  const lowerTask = task.toLowerCase();

  // Pattern matching for time savings
  const patterns = [
    {
      keywords: ["save", "saving", "save time"],
      multiplier: 1,
    },
    {
      keywords: ["automate", "automation", "script"],
      multiplier: 50, // Automation typically saves 50h/year
    },
    {
      keywords: ["optimize", "streamline", "improve workflow"],
      multiplier: 20, // Optimization saves ~20h/year
    },
    {
      keywords: ["eliminate", "remove", "stop"],
      multiplier: 30, // Elimination saves ~30h/year
    },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some((kw) => lowerTask.includes(kw))) {
      // Check if specific time is mentioned
      const timeMatch = lowerTask.match(/(\d+)\s*(min|hour|hr|h)/i);
      if (timeMatch) {
        const amount = parseFloat(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();

        let hoursPerInstance = amount;
        if (unit.startsWith("min")) {
          hoursPerInstance = amount / 60;
        }

        // Estimate frequency
        if (lowerTask.includes("daily") || lowerTask.includes("every day")) {
          return hoursPerInstance * 365; // Daily task
        } else if (lowerTask.includes("weekly") || lowerTask.includes("week")) {
          return hoursPerInstance * 52; // Weekly task
        } else if (
          lowerTask.includes("monthly") ||
          lowerTask.includes("month")
        ) {
          return hoursPerInstance * 12; // Monthly task
        } else {
          return hoursPerInstance * 52; // Default: weekly
        }
      }

      return pattern.multiplier; // Default multiplier
    }
  }

  return 0; // No time savings detected
}

/**
 * Estimates hours required to complete task
 */
function estimateHours(task: string): number {
  const lowerTask = task.toLowerCase();

  // Simple tasks: 1-2 hours
  if (
    lowerTask.includes("email") ||
    lowerTask.includes("call") ||
    lowerTask.includes("review") ||
    lowerTask.includes("read")
  ) {
    return 1;
  }

  // Medium tasks: 4-8 hours
  if (
    lowerTask.includes("write") ||
    lowerTask.includes("create") ||
    lowerTask.includes("build deck") ||
    lowerTask.includes("pitch deck")
  ) {
    return 6;
  }

  // Large tasks: 20-40 hours
  if (
    lowerTask.includes("build platform") ||
    lowerTask.includes("develop") ||
    lowerTask.includes("implement") ||
    lowerTask.includes("redesign")
  ) {
    return 30;
  }

  // Automation/scripting: 4-12 hours
  if (
    lowerTask.includes("automate") ||
    lowerTask.includes("script") ||
    lowerTask.includes("workflow")
  ) {
    return 8;
  }

  // Default: 4 hours
  return 4;
}

/**
 * Calculates payback period
 */
function calculatePaybackPeriod(value: number, cost: number): string {
  if (cost === 0) return "Immediate";

  // If value is in hours saved per year
  if (value < 1000) {
    const weeksToPayback = (cost / value) * 52;

    if (weeksToPayback < 1) {
      return "1 week";
    } else if (weeksToPayback < 4) {
      return `${Math.ceil(weeksToPayback)} weeks`;
    } else if (weeksToPayback < 52) {
      return `${Math.ceil(weeksToPayback / 4)} months`;
    } else {
      return `${Math.ceil(weeksToPayback / 52)} years`;
    }
  }

  // If value is in dollars
  // Assume hourly rate of $100 for entrepreneur time
  const hourlyRate = 100;
  const valueInHours = value / hourlyRate;
  const weeksToPayback = (cost / valueInHours) * 52;

  if (weeksToPayback < 1) {
    return "Immediate";
  } else if (weeksToPayback < 4) {
    return `${Math.ceil(weeksToPayback)} weeks`;
  } else if (weeksToPayback < 52) {
    return `${Math.ceil(weeksToPayback / 4)} months`;
  } else {
    return `${Math.ceil(weeksToPayback / 52)} years`;
  }
}

/**
 * Determines recommendation based on ROI
 */
function getRecommendation(
  roi: number,
  value: number,
  cost: number,
): {
  recommendation: ROIRecommendation;
  reasoning: string;
} {
  // ROI thresholds
  const HIGH_ROI = 10; // 10x return or better
  const MEDIUM_ROI = 3; // 3x return
  const LOW_ROI = 1; // Break even

  // Cost thresholds (hours)
  const LOW_COST = 2;
  const MEDIUM_COST = 8;

  if (roi >= HIGH_ROI) {
    return {
      recommendation: "do-now",
      reasoning: `Exceptional ROI (${roi.toFixed(1)}x). High-leverage activity - prioritize immediately.`,
    };
  }

  if (roi >= MEDIUM_ROI && cost <= LOW_COST) {
    return {
      recommendation: "do-now",
      reasoning: `Good ROI (${roi.toFixed(1)}x) + low effort (${cost}h). Quick win - do it now.`,
    };
  }

  if (roi >= MEDIUM_ROI && cost <= MEDIUM_COST) {
    return {
      recommendation: "do-later",
      reasoning: `Good ROI (${roi.toFixed(1)}x) but moderate effort (${cost}h). Schedule for this week.`,
    };
  }

  if (roi >= LOW_ROI && cost <= LOW_COST) {
    return {
      recommendation: "do-later",
      reasoning: `Neutral ROI (${roi.toFixed(1)}x) but low effort (${cost}h). Do when you have time.`,
    };
  }

  if (roi >= MEDIUM_ROI && cost > MEDIUM_COST) {
    return {
      recommendation: "delegate",
      reasoning: `Good ROI (${roi.toFixed(1)}x) but high effort (${cost}h). Delegate if possible.`,
    };
  }

  if (roi < LOW_ROI) {
    return {
      recommendation: "drop",
      reasoning: `Poor ROI (${roi.toFixed(1)}x). Not worth the time investment (${cost}h).`,
    };
  }

  return {
    recommendation: "do-later",
    reasoning: `Moderate ROI (${roi.toFixed(1)}x), moderate effort (${cost}h). Schedule when priorities allow.`,
  };
}

/**
 * Main function: Estimates ROI for a task
 */
export function estimateTaskROI(
  task: string,
  context: string = "",
): ROIEstimate {
  const fullText = `${task} ${context}`;

  // Try to extract monetary value
  let estimatedValue = parseMonetaryValue(fullText);

  // If no monetary value, estimate time savings
  if (!estimatedValue) {
    const timeSavings = estimateTimeSavings(fullText);
    if (timeSavings > 0) {
      // Convert hours to dollar value (assume $100/hr entrepreneur time)
      estimatedValue = timeSavings * 100;
    }
  }

  // If still no value, check for deal/revenue context
  if (!estimatedValue) {
    if (
      fullText.toLowerCase().includes("deal") ||
      fullText.toLowerCase().includes("pitch deck")
    ) {
      // Extract deal size if mentioned
      const dealMatch = fullText.match(/([R€$])\s*(\d+(?:\.\d+)?)\s*M/i);
      if (dealMatch) {
        estimatedValue = parseMonetaryValue(dealMatch[0]) || 1_000_000;
      } else {
        estimatedValue = 1_000_000; // Default: $1M deal
      }
    }
  }

  // Default value if nothing detected
  if (!estimatedValue || estimatedValue === 0) {
    estimatedValue = 1000; // Default: $1000 value
  }

  // Estimate hours required
  const estimatedCost = estimateHours(task);

  // Calculate ROI (value per hour)
  const roi = estimatedCost > 0 ? estimatedValue / estimatedCost : 0;

  // Calculate payback period
  const paybackPeriod = calculatePaybackPeriod(estimatedValue, estimatedCost);

  // Get recommendation
  const { recommendation, reasoning } = getRecommendation(
    roi,
    estimatedValue,
    estimatedCost,
  );

  return {
    task,
    estimatedValue,
    estimatedCost,
    roi,
    paybackPeriod,
    recommendation,
    reasoning,
  };
}

/**
 * Batch estimate ROI for multiple tasks
 */
export function batchEstimateROI(
  tasks: string[],
  context: string = "",
): ROIEstimate[] {
  return tasks
    .map((task) => estimateTaskROI(task, context))
    .sort((a, b) => b.roi - a.roi); // Sort by ROI descending
}

/**
 * Get summary of ROI estimates
 */
export function getROISummary(estimates: ROIEstimate[]): {
  avgROI: number;
  totalValue: number;
  totalCost: number;
  highLeverageCount: number;
  recommendations: Record<ROIRecommendation, number>;
} {
  const summary = {
    avgROI: 0,
    totalValue: 0,
    totalCost: 0,
    highLeverageCount: 0,
    recommendations: {
      "do-now": 0,
      "do-later": 0,
      delegate: 0,
      drop: 0,
    } as Record<ROIRecommendation, number>,
  };

  if (estimates.length === 0) return summary;

  summary.totalValue = estimates.reduce((sum, e) => sum + e.estimatedValue, 0);
  summary.totalCost = estimates.reduce((sum, e) => sum + e.estimatedCost, 0);
  summary.avgROI =
    estimates.reduce((sum, e) => sum + e.roi, 0) / estimates.length;
  summary.highLeverageCount = estimates.filter((e) => e.roi >= 10).length;

  for (const estimate of estimates) {
    summary.recommendations[estimate.recommendation]++;
  }

  return summary;
}
