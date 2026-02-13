import { describe, it, expect } from "vitest";
import { detectBiases, getBiasSummary } from "$lib/utils/bias-detector";
import { generateContrarianView } from "$lib/utils/contrarian-agent";
import { challengeAssumptions } from "$lib/utils/first-principles-challenger";
import { estimateTaskROI, batchEstimateROI } from "$lib/utils/roi-estimator";

describe("Bias Detector", () => {
  it("detects sunk cost fallacy", () => {
    const text =
      "I've already invested R10M in this project, so I can't give up now.";
    const biases = detectBiases(text);

    expect(biases.length).toBeGreaterThan(0);
    expect(biases.some((b) => b.type === "sunk-cost")).toBe(true);
  });

  it("detects confirmation bias", () => {
    const text =
      "Everyone says this is the right move. Obviously we should do it.";
    const biases = detectBiases(text);

    expect(biases.some((b) => b.type === "confirmation")).toBe(true);
  });

  it("detects anchoring bias", () => {
    const text = "They originally wanted R25M, so R20M is a great deal.";
    const biases = detectBiases(text);

    expect(biases.some((b) => b.type === "anchoring")).toBe(true);
  });

  it("detects optimism bias", () => {
    const text = "This definitely will succeed. It can't fail.";
    const biases = detectBiases(text);

    expect(biases.some((b) => b.type === "optimism")).toBe(true);
  });

  it("detects loss aversion", () => {
    const text = "I don't want to lose this opportunity. What if I regret it?";
    const biases = detectBiases(text);

    expect(biases.some((b) => b.type === "loss-aversion")).toBe(true);
  });

  it("calculates high severity correctly", () => {
    const text =
      "I've already invested R10M and can't give up now. This definitely will work.";
    const biases = detectBiases(text);

    const highSeverity = biases.filter((b) => b.severity === "high");
    expect(highSeverity.length).toBeGreaterThan(0);
  });

  it("generates summary correctly", () => {
    const text =
      "I've already spent R10M. Everyone says to continue. Obviously the right choice.";
    const biases = detectBiases(text);
    const summary = getBiasSummary(biases);

    expect(summary.total).toBeGreaterThan(0);
    expect(summary.mostCommon).toBeTruthy();
  });
});

describe("Contrarian Agent", () => {
  it("generates contrarian view for accept decision", () => {
    const decision = "Accept Leon R25M hybrid deal";
    const reasoning =
      "Partnership potential is huge and it's R9M premium over Colin's offer.";

    const contrarian = generateContrarianView(decision, reasoning);

    expect(contrarian).toBeTruthy();
    expect(contrarian?.opposite).toContain("reject");
    expect(contrarian?.evidence.length).toBeGreaterThan(0);
    expect(contrarian?.questions.length).toBeGreaterThan(0);
  });

  it("generates contrarian view for reject decision", () => {
    const decision = "Reject the R16M cash offer";
    const reasoning = "I want to hold out for a better deal.";

    const contrarian = generateContrarianView(decision, reasoning);

    expect(contrarian).toBeTruthy();
    expect(contrarian?.opposite).toContain("accept");
  });

  it("calculates probability based on weak reasoning", () => {
    const decision = "Accept the deal";
    const reasoning =
      "I feel like this could work. Maybe it will be good. Hopefully we can make it succeed.";

    const contrarian = generateContrarianView(decision, reasoning);

    expect(contrarian).toBeTruthy();
    // Weak signals (feel, could, maybe, hopefully) should increase probability
    expect(contrarian!.probability).toBeGreaterThan(30);
  });

  it("extracts entities correctly", () => {
    const decision = "Accept @leon R25M deal for 5 years";
    const reasoning = "Better than @colin R16M offer.";

    const contrarian = generateContrarianView(decision, reasoning);

    expect(contrarian).toBeTruthy();
    // Should extract people and amounts
    expect(contrarian!.evidence.length).toBeGreaterThan(0);
  });
});

describe("First Principles Challenger", () => {
  it("challenges necessity assumptions", () => {
    const text = "I need to sell the business because family wants out.";
    const challenges = challengeAssumptions(text);

    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges[0].reasoning).toContain("Necessity");
  });

  it("challenges social proof assumptions", () => {
    const text = "Everyone does M&A this way, so I should too.";
    const challenges = challengeAssumptions(text);

    expect(challenges.some((c) => c.reasoning.includes("Social proof"))).toBe(
      true,
    );
  });

  it("challenges constraint assumptions", () => {
    const text = "The price has to be R20M or the deal won't work.";
    const challenges = challengeAssumptions(text);

    expect(challenges.some((c) => c.reasoning.includes("Constraint"))).toBe(
      true,
    );
  });

  it("challenges absolute assumptions", () => {
    const text =
      "Buyers always want discounts. This never works without price reduction.";
    const challenges = challengeAssumptions(text);

    expect(challenges.some((c) => c.reasoning.includes("Absolutes"))).toBe(
      true,
    );
  });

  it("provides alternative perspectives", () => {
    const text = "I must exit because I've already decided.";
    const challenges = challengeAssumptions(text);

    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges[0].alternatives.length).toBeGreaterThan(0);
  });

  it("identifies fundamental truths", () => {
    const text = "Everyone says vertical integration is the best strategy.";
    const challenges = challengeAssumptions(text);

    expect(challenges.some((c) => c.fundamentalTruth !== null)).toBe(true);
  });
});

describe("ROI Estimator", () => {
  it("estimates ROI for M&A pitch deck correctly", () => {
    const task = "Build M&A pitch deck for R25M deal";
    const roi = estimateTaskROI(task);

    expect(roi.estimatedValue).toBeGreaterThan(100000); // Should extract R25M
    expect(roi.estimatedCost).toBeGreaterThan(0);
    expect(roi.roi).toBeGreaterThan(1);
    expect(roi.recommendation).toBe("do-now"); // High value task
  });

  it("estimates ROI for automation correctly", () => {
    const task = "Automate email workflow to save 30 minutes daily";
    const roi = estimateTaskROI(task);

    expect(roi.estimatedValue).toBeGreaterThan(0); // Should calculate time savings
    expect(roi.estimatedCost).toBeGreaterThan(0);
    expect(roi.roi).toBeGreaterThan(1);
  });

  it("recommends drop for low ROI tasks", () => {
    const task = "Redesign personal website";
    const roi = estimateTaskROI(task);

    // No clear value, high effort = should be drop or do-later
    expect(["drop", "do-later"]).toContain(roi.recommendation);
  });

  it("calculates payback period correctly", () => {
    const task = "Build pitch deck for R8M raise";
    const roi = estimateTaskROI(task);

    expect(roi.paybackPeriod).toBeTruthy();
    expect(roi.paybackPeriod).toMatch(/week|month|Immediate/);
  });

  it("batch estimates ROI and sorts by ROI", () => {
    const tasks = [
      "Redesign website",
      "Build M&A pitch deck for R20M deal",
      "Automate daily workflow to save 1 hour",
    ];

    const estimates = batchEstimateROI(tasks);

    expect(estimates.length).toBe(3);
    // Should be sorted by ROI descending
    expect(estimates[0].roi).toBeGreaterThanOrEqual(estimates[1].roi);
    expect(estimates[1].roi).toBeGreaterThanOrEqual(estimates[2].roi);
  });

  it("formats currency correctly", () => {
    const task = "Create investor deck for R5M raise";
    const roi = estimateTaskROI(task);

    // Should parse R5M correctly
    expect(roi.estimatedValue).toBeGreaterThan(1000000);
  });
});

describe("Integration Tests", () => {
  it("detects biases and generates contrarian view together", () => {
    const text =
      "I've already invested R10M so I can't stop now. Everyone agrees this is right.";
    const decision = "Continue investing";
    const reasoning = "Already committed R10M, everyone supports it.";

    const biases = detectBiases(text);
    const contrarian = generateContrarianView(decision, reasoning);

    expect(biases.length).toBeGreaterThan(0);
    expect(contrarian).toBeTruthy();
    expect(contrarian!.probability).toBeGreaterThan(40); // Weak reasoning
  });

  it("challenges assumptions and estimates ROI together", () => {
    const text = "I need to build this feature to compete with everyone.";
    const tasks = ["Build competitive feature"];

    const challenges = challengeAssumptions(text);
    const estimates = batchEstimateROI(tasks);

    expect(challenges.length).toBeGreaterThan(0);
    expect(estimates.length).toBe(1);
  });
});
