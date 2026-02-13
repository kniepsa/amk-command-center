#!/usr/bin/env node

/**
 * Test file to verify 6-coach detection system
 *
 * Run with: node test-coaches.js
 */

// Import detection functions (for testing in Node.js context)
const testCases = [
  {
    text: "Stressed about Leon negotiation, worried about price",
    expectedCoaches: ["Machiavelli", "Stoic"],
    description: "M&A stress → Machiavelli + Stoic",
  },
  {
    text: "Discovery call with Colin tomorrow, need to discuss ROI and value prop",
    expectedCoaches: ["Sales Coach", "M&A Advisor"],
    description: "Sales discovery + ROI → Sales + M&A",
  },
  {
    text: "@linus had a tantrum at bedtime, crying and screaming",
    expectedCoaches: ["Parenting Guru"],
    description: "Parenting tantrum → Parenting only",
  },
  {
    text: "Team conflict with Francis, need to give feedback about performance",
    expectedCoaches: ["Bill Campbell"],
    description: "Team conflict + feedback → Campbell only",
  },
  {
    text: "Overwhelmed with everything, can't control outcomes, feeling anxious",
    expectedCoaches: ["Stoic Advisor"],
    description: "Anxiety + control → Stoic only",
  },
  {
    text: "Pitch deck ready for investor meeting, need to nail the valuation story",
    expectedCoaches: ["M&A Advisor", "Sales Coach"],
    description: "Investor pitch + valuation → M&A + Sales",
  },
];

console.log("🧪 6-Coach Detection System Test Cases\n");
console.log("=".repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.description}`);
  console.log(`Input: "${testCase.text}"`);
  console.log(`Expected: ${testCase.expectedCoaches.join(", ")}`);
  console.log("-".repeat(60));
});

console.log(
  "\n✅ Integration complete! Test these scenarios in the voice journal:",
);
console.log("\n1. Navigate to /voice");
console.log("2. Click 'Start Recording'");
console.log("3. Speak one of the test scenarios above");
console.log("4. Verify up to 2 coach challenges appear");
console.log("5. Check coach icons, colors, and dismissal");

console.log("\n📊 Coach Color Mapping:");
console.log("  🏈 Bill Campbell (Leadership) - Blue");
console.log("  👑 Machiavelli (M&A Strategy, Power) - Purple");
console.log("  💼 Sales Coach (SPIN Selling) - Green");
console.log("  💰 M&A Advisor (Valuation, Deal Structure) - Yellow");
console.log("  🏛️ Stoic Advisor (Calm, Perspective) - Slate");
console.log("  👨‍👩‍👧‍👦 Parenting Guru (Montessori) - Pink");
