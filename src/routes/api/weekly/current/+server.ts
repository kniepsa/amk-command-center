/**
 * GET /api/weekly/current
 *
 * Returns current week's priorities with progress tracking.
 *
 * Phase 1: Reads from weekly plan markdown file
 * Phase 2: Will track daily progress by parsing entries
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { CurrentWeekResponse, WeeklyPriority } from "$lib/types";
import {
  getCurrentWeekString,
  getCurrentWeeklyPlan,
  fileExists,
} from "$lib/server/file-utils";

export const GET: RequestHandler = async () => {
  try {
    const currentWeek = getCurrentWeekString();

    // TODO: Phase 2 - Read actual weekly plan file and parse priorities
    // const weeklyPlan = await getCurrentWeeklyPlan();

    // ========================================================================
    // MOCK IMPLEMENTATION (Phase 1)
    // ========================================================================

    // Check if weekly plan exists
    const weeklyPlan = await getCurrentWeeklyPlan();

    if (!weeklyPlan) {
      // Return empty priorities if no weekly plan exists
      const response: CurrentWeekResponse = {
        week: currentWeek,
        priorities: [],
      };
      return json(response);
    }

    // Extract priorities from frontmatter
    const priorities = extractPriorities(weeklyPlan.frontmatter, currentWeek);

    const response: CurrentWeekResponse = {
      week: currentWeek,
      priorities,
    };

    return json(response);
  } catch (error) {
    console.error("Error in /api/weekly/current:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

// ============================================================================
// Priority Extraction
// ============================================================================

function extractPriorities(
  frontmatter: Record<string, unknown>,
  week: string,
): WeeklyPriority[] {
  // Try to extract priorities from frontmatter
  const prioritiesData = frontmatter.priorities as
    | Array<{
        id?: string;
        text?: string;
        days_active?: string[];
        status?: string;
      }>
    | undefined;

  if (!prioritiesData || !Array.isArray(prioritiesData)) {
    // Fallback to mock data if no priorities in frontmatter
    return getMockPriorities(week);
  }

  return prioritiesData.map((p, index) => {
    const id = p.id || `${week}-p${index + 1}`;
    const text = p.text || "Untitled Priority";
    const daysActive = Array.isArray(p.days_active) ? p.days_active.length : 0;
    const totalDays = 7;

    return {
      id,
      text,
      days_active: daysActive,
      total_days: totalDays,
      progress_percent: Math.round((daysActive / totalDays) * 100),
      status: (p.status as WeeklyPriority["status"]) || "in_progress",
    };
  });
}

// ============================================================================
// Mock Data (Fallback)
// ============================================================================

function getMockPriorities(week: string): WeeklyPriority[] {
  // Example priorities based on actual journal patterns
  return [
    {
      id: `${week}-p1`,
      text: "Close Printulu deal (Leon/Jerome/Abdul)",
      days_active: 2,
      total_days: 7,
      progress_percent: 29,
      status: "in_progress",
    },
    {
      id: `${week}-p2`,
      text: "Sales learning Day 8-14 (SPIN framework)",
      days_active: 2,
      total_days: 7,
      progress_percent: 29,
      status: "in_progress",
    },
    {
      id: `${week}-p3`,
      text: "Plan Germany real estate pitch (Hulisani)",
      days_active: 0,
      total_days: 7,
      progress_percent: 0,
      status: "in_progress",
    },
    {
      id: `${week}-p4`,
      text: "Command Center V2 development",
      days_active: 1,
      total_days: 7,
      progress_percent: 14,
      status: "in_progress",
    },
    {
      id: `${week}-p5`,
      text: "Blueprint nutrition tracking",
      days_active: 3,
      total_days: 7,
      progress_percent: 43,
      status: "in_progress",
    },
  ];
}

// ============================================================================
// TODO: Phase 2 - Daily Progress Tracking
// ============================================================================

/*
async function calculateDailyProgress(
  priorities: WeeklyPriority[],
  weekStartDate: string
): Promise<WeeklyPriority[]> {
  // Parse daily entries for the week
  // Count how many days each priority was mentioned
  // Update days_active and progress_percent

  const weekDates = getWeekDates(weekStartDate);

  for (const priority of priorities) {
    let daysActive = 0;

    for (const date of weekDates) {
      const entry = await readDailyEntry(date);

      if (!entry) continue;

      // Check if priority mentioned in intentions
      const mentioned = entry.intentions?.some((intention) =>
        intention.text?.toLowerCase().includes(priority.text.toLowerCase().split(' ')[0])
      );

      if (mentioned) {
        daysActive++;
      }
    }

    priority.days_active = daysActive;
    priority.progress_percent = Math.round((daysActive / priority.total_days) * 100);
  }

  return priorities;
}

function getWeekDates(startDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}
*/
