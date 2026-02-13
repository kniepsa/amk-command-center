/**
 * Journal file reader utilities
 * Reads from amk-journal repository
 */

import { readFile, readdir } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";

const JOURNAL_PATH = "/Users/amk/Projects/amk-journal";

export interface WeeklyPlan {
  week: string;
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Get the most recent weekly plan file
 */
export async function getMostRecentWeeklyPlan(): Promise<WeeklyPlan | null> {
  try {
    const weeklyPlansDir = join(JOURNAL_PATH, "users/amk/weekly-plans");
    const files = await readdir(weeklyPlansDir);

    // Filter for .md files (exclude .ics and TEMPLATE.md)
    const mdFiles = files.filter(
      (f) => f.endsWith(".md") && f !== "TEMPLATE.md",
    );

    if (mdFiles.length === 0) return null;

    // Sort by filename (2026-W03.md, 2026-W04.md, etc.)
    mdFiles.sort().reverse();

    // Read the most recent one
    const latestFile = mdFiles[0];
    const filePath = join(weeklyPlansDir, latestFile);
    const fileContent = await readFile(filePath, "utf-8");

    // Parse frontmatter
    const { data: frontmatter, content } = matter(fileContent);

    return {
      week: latestFile.replace(".md", ""),
      frontmatter,
      content,
    };
  } catch (error) {
    console.error("Error reading weekly plan:", error);
    return null;
  }
}

/**
 * Extract priorities from weekly plan
 */
export function extractPrioritiesFromWeeklyPlan(plan: WeeklyPlan) {
  const priorities: Array<{
    id: string;
    text: string;
    days_active: number;
    total_days: number;
    progress_percent: number;
    status: "in_progress" | "completed" | "blocked";
  }> = [];

  // Parse the content for "## 🎯 Top 5 Priorities" section
  const lines = plan.content.split("\n");
  let inPrioritiesSection = false;
  let priorityIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Start of priorities section
    if (line.includes("🎯 Top") || line.includes("Top 5 Priorities")) {
      inPrioritiesSection = true;
      continue;
    }

    // End of priorities section (next major section)
    if (
      inPrioritiesSection &&
      line.startsWith("## ") &&
      !line.includes("Top")
    ) {
      break;
    }

    // Extract priority headers (### 1. or ### 2.)
    if (inPrioritiesSection && line.match(/^###\s+\d+\.\s+/)) {
      const title = line.replace(/^###\s+\d+\.\s+/, "").trim();
      priorityIndex++;

      // Check if there's a "Status:" line nearby
      let status: "in_progress" | "completed" | "blocked" = "in_progress";
      let daysActive = 0;

      // Look ahead for status markers
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const statusLine = lines[j];

        if (statusLine.includes("Status:")) {
          if (statusLine.includes("[x]") || statusLine.includes("✅")) {
            status = "completed";
            daysActive = 7; // Assume completed = all days done
          } else if (statusLine.includes("[ ]")) {
            status = "in_progress";
            // Count checkboxes before this status line
            const prevLines = lines.slice(i + 1, j).join("\n");
            const completedCount = (prevLines.match(/\[x\]/g) || []).length;
            const totalCount = (prevLines.match(/\[[x\s]\]/g) || []).length;
            daysActive =
              totalCount > 0
                ? Math.round((completedCount / totalCount) * 7)
                : 0;
          }
          break;
        }

        // Alternative: check for completed items in the priority
        if (statusLine.includes("[x]")) {
          daysActive++;
        }
      }

      priorities.push({
        id: `${plan.week}-p${priorityIndex}`,
        text: title,
        days_active: daysActive,
        total_days: 7,
        progress_percent: Math.round((daysActive / 7) * 100),
        status,
      });

      if (priorities.length >= 5) break;
    }
  }

  return priorities;
}
