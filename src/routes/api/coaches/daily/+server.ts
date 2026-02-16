/**
 * DEPRECATED: This route has been migrated to the backend.
 *
 * This file is kept for backward compatibility but should be removed once all clients
 * have migrated to use the backend API:
 * - Backend: /api/v1/coaches/daily (GET)
 * - Frontend: Uses journal-client.ts (getDailyCoaches)
 *
 * Migration completed: 2026-02-15
 * Safe to delete after verification.
 *
 * ============================================================================
 * LEGACY ROUTE - DO NOT USE
 * ============================================================================
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const coaches = [
    {
      id: "campbell",
      name: "Bill Campbell",
      icon: "🏈",
      recommendation: "Stop delegating. Start teaching.",
      perspectives: {
        observation: `I see you're trying to do everything yourself while your team waits for instructions.`,
        challenge: `Spend 30 minutes TODAY teaching someone on your team to do one thing you did yesterday.`,
        why: `Great leaders multiply themselves. You're the bottleneck because you won't let go of the steering wheel.`,
      },
    },
    {
      id: "drucker",
      name: "Peter Drucker",
      icon: "📊",
      recommendation: `Measure what matters. Kill what doesn't.`,
      perspectives: {
        observation: `Your task list has 47 items. Only 3 create actual value. The rest is noise.`,
        challenge: `Delete 80% of your TODO list. If it doesn't directly grow revenue or reduce risk, it's a distraction.`,
        why: `Efficiency is doing things right. Effectiveness is doing the right things. You're drowning in efficiency.`,
      },
    },
    {
      id: "machiavelli",
      name: "Machiavelli",
      icon: "👑",
      recommendation: "Your reputation is bleeding. Fix it now.",
      perspectives: {
        observation: `You ghosted 3 buyers this week. They're talking to each other. Your 'busy' excuse sounds like weakness.`,
        challenge: `Send a SHORT, direct message to every buyer TODAY. "Here's where we are. Here's the deadline. Yes or no by Friday."`,
        why: `Fear of bad news creates paralysis. Paralysis creates rumors. Rumors destroy deals. Decisive action restores respect.`,
      },
    },
  ];

  return json({ coaches });
};
