/**
 * GET /api/weekly-review/data
 *
 * Loads data for weekly review:
 * - Completed tasks from last week
 * - Energy levels by day
 * - Habit streaks
 * - Inbox items needing clarification
 * - All active tasks for priority selection
 */

import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";

export const GET: RequestHandler = async () => {
  try {
    const journalPath =
      process.env.JOURNAL_PATH || "/Users/amk/Projects/amk-journal";
    const entriesPath = join(journalPath, "users/amk/entries");

    // Get last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Read all entry files
    const files = await readdir(entriesPath);
    const entryFiles = files.filter(
      (f) => f.endsWith(".md") && !f.includes("eo-") && !f.includes(".tmp"),
    );

    // Parse entries from last week
    const completedTasks: Array<{
      title: string;
      date: string;
      area?: string;
    }> = [];
    const energyByDay: Array<{
      date: string;
      energy: "high" | "medium" | "low" | "drained";
    }> = [];
    const inboxItems: Array<{ id: string; title: string; date: string }> = [];
    const habitData: Record<
      string,
      { name: string; completions: number; streak: number }
    > = {};

    for (const file of entryFiles) {
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})\.md$/);
      if (!dateMatch) continue;

      const entryDate = new Date(dateMatch[1]);
      if (entryDate < sevenDaysAgo || entryDate > today) continue;

      const content = await readFile(join(entriesPath, file), "utf-8");
      const parsed = matter(content);

      // Extract energy
      if (parsed.data.energy) {
        energyByDay.push({
          date: dateMatch[1],
          energy: parsed.data.energy,
        });
      }

      // Extract completed tasks (look for [RESOLVED] in body)
      const bodyLines = parsed.content.split("\n");
      for (const line of bodyLines) {
        if (line.includes("[RESOLVED]")) {
          const taskMatch = line.match(/\[RESOLVED\]\s*(.+)/);
          if (taskMatch) {
            const taskTitle = taskMatch[1].trim();
            const areaMatch = taskTitle.match(/#(\w+)/);
            completedTasks.push({
              title: taskTitle.replace(/#\w+/g, "").trim(),
              date: dateMatch[1],
              area: areaMatch ? areaMatch[1] : undefined,
            });
          }
        }
      }

      // Extract inbox items (look for [OPEN] without context)
      for (const line of bodyLines) {
        if (line.includes("[OPEN]") && !line.includes("@")) {
          const taskMatch = line.match(/\[OPEN\]\s*(.+)/);
          if (taskMatch) {
            const taskTitle = taskMatch[1].trim();
            inboxItems.push({
              id: `inbox-${dateMatch[1]}-${inboxItems.length}`,
              title: taskTitle,
              date: dateMatch[1],
            });
          }
        }
      }

      // Extract habit completions
      if (parsed.data.habits) {
        for (const [habitKey, completed] of Object.entries(
          parsed.data.habits,
        )) {
          if (completed) {
            if (!habitData[habitKey]) {
              habitData[habitKey] = {
                name: formatHabitName(habitKey),
                completions: 0,
                streak: 0,
              };
            }
            habitData[habitKey].completions++;
          }
        }
      }
    }

    // Calculate habit streaks (simplified - just use completions)
    const habits = Object.values(habitData).map((h) => ({
      name: h.name,
      streak: h.completions, // Simplified: streak = completions this week
      completed_this_week: h.completions,
    }));

    // Load all active tasks from NEXT.md
    const nextMdPath = join(journalPath, "users/amk/next.md");
    let allTasks: Array<{ id: string; title: string; area: string }> = [];

    try {
      const nextMdContent = await readFile(nextMdPath, "utf-8");
      const lines = nextMdContent.split("\n");
      let currentArea = "general";

      for (const line of lines) {
        // Detect area headers
        const areaMatch = line.match(/^##\s+(.+)/);
        if (areaMatch) {
          currentArea = areaMatch[1].toLowerCase().replace(/\s+/g, "-");
          continue;
        }

        // Detect task bullets
        const taskMatch = line.match(/^[-*]\s+(.+)/);
        if (taskMatch) {
          const taskTitle = taskMatch[1].trim();
          allTasks.push({
            id: `task-${allTasks.length}`,
            title: taskTitle,
            area: currentArea,
          });
        }
      }
    } catch (err) {
      console.warn("Could not read NEXT.md:", err);
      // Continue with empty tasks
    }

    return json({
      completedTasks,
      energyByDay: energyByDay.sort((a, b) => a.date.localeCompare(b.date)),
      habits,
      inboxItems,
      allTasks,
    });
  } catch (err) {
    console.error("Error loading weekly review data:", err);
    throw error(500, {
      message:
        err instanceof Error
          ? err.message
          : "Failed to load weekly review data",
    });
  }
};

function formatHabitName(key: string): string {
  const names: Record<string, string> = {
    running: "Running",
    sauna: "Sauna",
    sales_learning: "Sales Learning",
    journaling: "Journaling",
    three_daily_happiness: "3 Daily Happiness",
    vampire_shot: "Vampire Shot",
    morning_electrolytes: "Morning Electrolytes",
    supplements: "Supplements",
    plan_tomorrow: "Plan Tomorrow",
    plan_next_week: "Plan Next Week",
  };
  return names[key] || key;
}
