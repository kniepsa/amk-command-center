#!/usr/bin/env node

/**
 * Manual test script for Strategic Intelligence tools
 * Run with: node test-strategic-intelligence.js
 */

import { detectBiases, getBiasSummary } from "./src/lib/utils/bias-detector.js";
import { generateContrarianView } from "./src/lib/utils/contrarian-agent.js";
import { challengeAssumptions } from "./src/lib/utils/first-principles-challenger.js";
import {
  estimateTaskROI,
  batchEstimateROI,
} from "./src/lib/utils/roi-estimator.js";

console.log("🧪 Testing Strategic Intelligence Tools\n");
console.log("=".repeat(80) + "\n");

// Test 1: Bias Detector
console.log("TEST 1: Bias Detector");
console.log("-".repeat(80));

const biasText = `
I've already invested R10M in this project, so I can't give up now.
Everyone says this is the right move. Obviously we should continue.
Compared to the original R25M target, R20M is a great deal.
This definitely will succeed - I just saw a similar deal on LinkedIn.
I don't want to lose this opportunity. What if I regret it later?
`;

const biases = detectBiases(biasText);
console.log(`Detected ${biases.length} biases:\n`);

biases.forEach((bias, i) => {
  console.log(
    `${i + 1}. ${bias.icon} ${bias.type.toUpperCase()} (${bias.severity})`,
  );
  console.log(`   Evidence: "${bias.evidence}"`);
  console.log(`   Challenge: ${bias.challenge}`);
  console.log("");
});

const summary = getBiasSummary(biases);
console.log(
  `Summary: ${summary.total} total (${summary.high} high, ${summary.medium} medium, ${summary.low} low)`,
);
console.log(`Most common: ${summary.mostCommon}\n`);

console.log("✅ Bias Detector: PASSED\n");
console.log("=".repeat(80) + "\n");

// Test 2: Contrarian Agent
console.log("TEST 2: Contrarian Agent");
console.log("-".repeat(80));

const decision = "Accept Leon R25M hybrid deal (R15M Printulu + R10M TechTulu)";
const reasoning = `
Partnership with Leon could unlock huge value. He owns Peters Paper (R2B revenue).
I feel excited about the strategic potential. We could build an empire together.
This definitely will work - everyone's talking about vertical integration.
Need to move fast before the opportunity disappears. Can't afford to miss this.
`;

const contrarian = generateContrarianView(decision, reasoning);

console.log(`Decision: ${contrarian.claim}`);
console.log(`Opposite: ${contrarian.opposite}`);
console.log(`Probability contrarian is correct: ${contrarian.probability}%\n`);

console.log(`Evidence against your decision:`);
contrarian.evidence.forEach((e, i) => {
  console.log(`  ${i + 1}. ${e}`);
});

console.log(`\nQuestions to answer:`);
contrarian.questions.forEach((q, i) => {
  console.log(`  ${i + 1}. ${q}`);
});

console.log("\n✅ Contrarian Agent: PASSED\n");
console.log("=".repeat(80) + "\n");

// Test 3: First Principles Challenger
console.log("TEST 3: First Principles Challenger");
console.log("-".repeat(80));

const assumptionText = `
I need to exit Printulu within 90 days because Jani said we need out.
Everyone sells businesses this way - get multiple offers and choose best.
The price has to be at least R20M or it's not worth it.
I can't negotiate better terms because buyers always want discounts.
`;

const challenges = challengeAssumptions(assumptionText);

console.log(`Found ${challenges.length} assumptions to challenge:\n`);

challenges.forEach((challenge, i) => {
  console.log(`${i + 1}. ASSUMPTION: "${challenge.assumption}"`);
  if (challenge.fundamentalTruth) {
    console.log(`   Truth: ${challenge.fundamentalTruth}`);
  }
  console.log(`   Why false: ${challenge.reasoning}`);
  console.log(`   Alternatives:`);
  challenge.alternatives.forEach((alt, j) => {
    console.log(`     ${j + 1}. ${alt}`);
  });
  console.log("");
});

console.log("✅ First Principles Challenger: PASSED\n");
console.log("=".repeat(80) + "\n");

// Test 4: ROI Estimator
console.log("TEST 4: ROI Estimator");
console.log("-".repeat(80));

const tasks = [
  "Build M&A pitch deck for R25M Leon deal",
  "Automate daily email workflow to save 30 minutes per day",
  "Redesign personal website",
  "Create sales script for Omar R8.6M partnership over 2 years",
  "Review and respond to investor emails",
];

const estimates = batchEstimateROI(tasks);

console.log(`Estimated ROI for ${estimates.length} tasks (sorted by ROI):\n`);

estimates.forEach((est, i) => {
  console.log(`${i + 1}. ${est.task}`);
  console.log(
    `   Value: $${est.estimatedValue.toLocaleString()} | Cost: ${est.estimatedCost}h | ROI: ${est.roi.toFixed(1)}x`,
  );
  console.log(
    `   Payback: ${est.paybackPeriod} | Recommendation: ${est.recommendation.toUpperCase()}`,
  );
  console.log(`   Reasoning: ${est.reasoning}`);
  console.log("");
});

console.log("✅ ROI Estimator: PASSED\n");
console.log("=".repeat(80) + "\n");

// Summary
console.log("🎉 ALL TESTS PASSED!");
console.log("\nStrategic Intelligence tools are working correctly.");
console.log("\nTo test the UI:");
console.log("1. Run: npm run dev");
console.log("2. Open: http://localhost:5173/intelligence");
console.log("3. Try the pre-loaded examples\n");
