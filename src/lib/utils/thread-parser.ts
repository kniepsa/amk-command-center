/**
 * Thread/Project file parser
 * Extracts metadata, status, mentions from markdown files
 */

import type { Thread, ThreadMention, ThreadMetadata } from "$lib/types/thread";

/**
 * Categorize thread by filename pattern
 */
function categorizeThread(filename: string): Thread["category"] {
  const lower = filename.toLowerCase();

  if (lower.includes("printulu-exit") || lower.includes("-deal-")) {
    return "M&A";
  }
  if (lower.includes("partnership") || lower.includes("strategic")) {
    return "Partnerships";
  }
  if (lower.includes("grillparzelle") || lower.includes("property")) {
    return "Property";
  }
  if (
    lower.includes("kyla") ||
    lower.includes("aupair") ||
    lower.includes("family")
  ) {
    return "Personal";
  }

  return "Other";
}

/**
 * Extract status tags: [OPEN], [WAITING], [RESOLVED]
 */
function extractStatus(content: string): Thread["status"] {
  if (/\[RESOLVED\]/i.test(content)) return "resolved";
  if (/\[WAITING\]/i.test(content)) return "waiting";
  return "open";
}

/**
 * Extract metadata from top section of markdown
 * Looks for patterns like:
 * **Status**: [OPEN]
 * **Contact**: Name
 * **Company**: Company Name
 */
function extractMetadata(content: string): ThreadMetadata {
  const metadata: ThreadMetadata = {};

  // Extract from bold key-value pairs
  const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/i);
  if (statusMatch) {
    metadata.status = statusMatch[1].replace(/\[|\]/g, "").trim();
  }

  const contactMatch = content.match(/\*\*Contact\*\*:\s*(.+)/i);
  if (contactMatch) {
    metadata.contact = contactMatch[1].trim();
  }

  const companyMatch = content.match(/\*\*Company\*\*:\s*(.+)/i);
  if (companyMatch) {
    metadata.company = companyMatch[1].trim();
  }

  const opportunityMatch = content.match(/\*\*Opportunity Type\*\*:\s*(.+)/i);
  if (opportunityMatch) {
    metadata.opportunityType = opportunityMatch[1].trim();
  }

  const investmentMatch = content.match(/\*\*Total Investment\*\*:\s*(.+)/i);
  if (investmentMatch) {
    metadata.totalInvestment = investmentMatch[1].trim();
  }

  // Extract Next Action and Blocker
  const nextActionMatch = content.match(/(?:next action|todo):\s*(.+)/i);
  if (nextActionMatch) {
    metadata.nextAction = nextActionMatch[1].trim();
  }

  const blockerMatch = content.match(/(?:blocker|blocked by|issue):\s*(.+)/i);
  if (blockerMatch) {
    metadata.blocker = blockerMatch[1].trim();
  }

  return metadata;
}

/**
 * Extract @mentions and [[framework]] references
 */
function extractMentions(content: string): ThreadMention[] {
  const mentions: ThreadMention[] = [];

  // Extract @person mentions
  const personMatches = content.matchAll(/@([a-z0-9-]+)/gi);
  for (const match of personMatches) {
    mentions.push({ type: "person", value: match[1] });
  }

  // Extract [[framework]] references
  const frameworkMatches = content.matchAll(/\[\[([a-z0-9-]+)\]\]/gi);
  for (const match of frameworkMatches) {
    mentions.push({ type: "framework", value: match[1] });
  }

  // Deduplicate
  const seen = new Set<string>();
  return mentions.filter((m) => {
    const key = `${m.type}:${m.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Extract title from first # heading
 */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

/**
 * Get content preview (first 150 chars after title)
 */
function extractPreview(content: string): string {
  // Remove title
  const withoutTitle = content.replace(/^#\s+.+$/m, "").trim();
  // Remove metadata section
  const withoutMeta = withoutTitle.replace(/\*\*[^*]+\*\*:[^\n]+/g, "").trim();
  // Take first 150 chars
  return withoutMeta.slice(0, 150).trim() + "...";
}

/**
 * Parse a thread markdown file
 */
export function parseThread(
  filename: string,
  content: string,
  lastModified: Date,
): Thread {
  const title = extractTitle(content);
  const category = categorizeThread(filename);
  const status = extractStatus(content);
  const metadata = extractMetadata(content);
  const mentions = extractMentions(content);
  const wordCount = content.split(/\s+/).length;
  const contentPreview = extractPreview(content);

  return {
    filename,
    title,
    category,
    status,
    metadata,
    mentions,
    lastModified,
    wordCount,
    contentPreview,
  };
}

/**
 * Calculate days since last update
 */
export function getDaysSinceUpdate(lastModified: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - lastModified.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days active (from creation date in filename if available, otherwise use lastModified)
 */
export function getDaysActive(thread: Thread): number {
  // Try to extract date from filename (e.g., printulu-exit-buyer-status-2026-02-09.md)
  const dateMatch = thread.filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const createdDate = new Date(dateMatch[0]);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  // Fallback to days since last update
  return getDaysSinceUpdate(thread.lastModified);
}
