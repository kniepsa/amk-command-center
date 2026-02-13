/**
 * GET /api/weekly/current
 *
 * Returns current week's priorities from actual weekly plan file
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { CurrentWeekResponse } from "$lib/types";
import {
  getMostRecentWeeklyPlan,
  extractPrioritiesFromWeeklyPlan,
} from "$lib/server/journal-reader";

export const GET: RequestHandler = async () => {
  try {
    // Get the most recent weekly plan from journal
    const weeklyPlan = await getMostRecentWeeklyPlan();

    if (!weeklyPlan) {
      // No weekly plan found - return empty
      return json({
        week: new Date().toISOString().split("T")[0],
        priorities: [],
      });
    }

    // Extract priorities from the plan
    const priorities = extractPrioritiesFromWeeklyPlan(weeklyPlan);

    const response: CurrentWeekResponse = {
      week: weeklyPlan.week,
      priorities,
    };

    return json(response);
  } catch (error) {
    console.error("Error in /api/weekly/current:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
