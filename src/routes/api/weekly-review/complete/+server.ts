/**
 * POST /api/weekly-review/complete
 *
 * Saves weekly review results:
 * - Top 5 priorities for next week
 * - Weekly intentions
 * - Completion timestamp
 */

import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import yaml from "js-yaml";

interface WeeklyReviewRequest {
  top5: Array<{ id: string; title: string; priority: number }>;
  intentions: string;
  completedAt: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as WeeklyReviewRequest;
    const { top5, intentions, completedAt } = body;

    // Validate request
    if (!top5 || top5.length !== 5) {
      throw error(400, "Must provide exactly 5 priorities");
    }

    if (!intentions) {
      throw error(400, "Intentions are required");
    }

    // Calculate week number (ISO 8601)
    const date = new Date(completedAt);
    const weekNumber = getISOWeekNumber(date);
    const year = date.getFullYear();
    const weekId = `${year}-W${String(weekNumber).padStart(2, "0")}`;

    const journalPath =
      process.env.JOURNAL_PATH || "/Users/amk/Projects/amk-journal";
    const weeklyPlansPath = join(journalPath, "users/amk/weekly-plans");

    // Ensure directory exists
    await mkdir(weeklyPlansPath, { recursive: true });

    // Build weekly plan content
    const frontmatter = {
      week: weekId,
      year,
      week_number: weekNumber,
      completed_at: completedAt,
      priorities: top5.map((p) => ({
        priority: p.priority,
        title: p.title,
        status: "pending",
      })),
    };

    const body_content = `# Week ${weekNumber} - ${year}\n\n## Intentions\n\n${intentions}\n\n## Top 5 Priorities\n\n${top5
      .sort((a, b) => a.priority - b.priority)
      .map((p) => `${p.priority}. ${p.title}`)
      .join(
        "\n",
      )}\n\n## Daily Progress\n\n*Track progress throughout the week*\n`;

    const fileContent = `---\n${yaml.dump(frontmatter)}---\n\n${body_content}`;

    // Save to file
    const filePath = join(weeklyPlansPath, `${weekId}.md`);
    await writeFile(filePath, fileContent, "utf-8");

    console.log(`Weekly review saved: ${weekId}`);

    return json({
      success: true,
      week: weekId,
      filePath,
    });
  } catch (err) {
    console.error("Error saving weekly review:", err);

    // Re-throw SvelteKit errors
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    throw error(500, {
      message:
        err instanceof Error ? err.message : "Failed to save weekly review",
    });
  }
};

// ISO 8601 week number calculation
function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return weekNo;
}
