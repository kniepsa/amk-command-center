#!/usr/bin/env node

/**
 * Test script to verify thread parser and health scoring
 * Reads real thread files and displays parsed results
 */

import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

const THREADS_PATH = "/Users/amk/Projects/amk-journal/users/amk/threads/active";

// Simplified versions of parser functions for testing
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

function extractStatus(content) {
  if (/\[RESOLVED\]/i.test(content)) return "resolved";
  if (/\[WAITING\]/i.test(content)) return "waiting";
  return "open";
}

function extractMetadata(content) {
  const metadata = {};

  const contactMatch = content.match(/\*\*Contact\*\*:\s*(.+)/i);
  if (contactMatch) metadata.contact = contactMatch[1].trim();

  const companyMatch = content.match(/\*\*Company\*\*:\s*(.+)/i);
  if (companyMatch) metadata.company = companyMatch[1].trim();

  const nextActionMatch = content.match(/(?:next action|todo):\s*(.+)/i);
  if (nextActionMatch) metadata.nextAction = nextActionMatch[1].trim();

  const blockerMatch = content.match(/(?:blocker|blocked by):\s*(.+)/i);
  if (blockerMatch) metadata.blocker = blockerMatch[1].trim();

  return metadata;
}

function calculateHealth(lastModified, metadata, status) {
  const daysSince = Math.floor(
    (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24),
  );

  let score = 0;

  // Days since update
  if (daysSince < 3) score += 40;
  else if (daysSince <= 7) score += 25;
  else if (daysSince <= 14) score += 10;

  // Has next action
  if (metadata.nextAction) score += 30;

  // No blockers
  if (!metadata.blocker) score += 20;

  // Status
  if (status === "open") score += 10;
  else if (status === "waiting") score += 5;

  const healthStatus =
    score >= 80 ? "🟢 GREEN" : score >= 50 ? "🟡 YELLOW" : "🔴 RED";

  return { score, status: healthStatus, daysSince };
}

async function main() {
  console.log("📊 Testing Projects Parser\n");
  console.log("Loading threads from:", THREADS_PATH);
  console.log("─".repeat(80), "\n");

  const files = await readdir(THREADS_PATH);
  const markdownFiles = files.filter((f) => f.endsWith(".md"));

  console.log(`Found ${markdownFiles.length} thread files\n`);

  // Parse first 5 files as samples
  const samples = markdownFiles.slice(0, 5);

  for (const filename of samples) {
    const filepath = join(THREADS_PATH, filename);
    const content = await readFile(filepath, "utf-8");
    const stats = await stat(filepath);

    const title = extractTitle(content);
    const status = extractStatus(content);
    const metadata = extractMetadata(content);
    const health = calculateHealth(stats.mtime, metadata, status);

    console.log(`📄 ${filename}`);
    console.log(`   Title: ${title}`);
    console.log(`   Status: [${status.toUpperCase()}]`);
    console.log(`   Health: ${health.status} (${health.score}/100)`);
    console.log(`   Days Since Update: ${health.daysSince}`);

    if (metadata.contact) console.log(`   Contact: ${metadata.contact}`);
    if (metadata.company) console.log(`   Company: ${metadata.company}`);
    if (metadata.nextAction)
      console.log(`   Next Action: ${metadata.nextAction}`);
    if (metadata.blocker) console.log(`   Blocker: ${metadata.blocker}`);

    console.log("");
  }

  console.log("─".repeat(80));
  console.log("\n✅ Parser test complete");
  console.log("\nTo run full dashboard: npm run dev");
}

main().catch(console.error);
