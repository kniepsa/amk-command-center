/**
 * Project health scoring algorithm
 * Calculates health status, momentum, and pipeline stage
 */

import type {
  Thread,
  ProjectHealth,
  ProjectWithHealth,
  PipelineStage,
} from "$lib/types/thread";
import { getDaysSinceUpdate, getDaysActive } from "./thread-parser";

/**
 * Calculate project health score (0-100)
 *
 * Scoring factors:
 * - Days since update (40 points): <3 days = 40, 3-7 = 25, >7 = 0
 * - Has next action (30 points): Yes = 30, No = 0
 * - Blockers (20 points): None = 20, 1+ = 0
 * - Status (10 points): Open = 10, Waiting = 5, Resolved = 0
 */
export function calculateProjectHealth(thread: Thread): ProjectHealth {
  const daysSinceUpdate = getDaysSinceUpdate(thread.lastModified);
  const daysActive = getDaysActive(thread);

  let score = 0;
  const blockers: string[] = [];

  // Days since update (40 points)
  if (daysSinceUpdate < 3) {
    score += 40;
  } else if (daysSinceUpdate <= 7) {
    score += 25;
  } else if (daysSinceUpdate <= 14) {
    score += 10;
  }
  // else: 0 points for >14 days

  // Has next action (30 points)
  if (thread.metadata.nextAction) {
    score += 30;
  } else {
    blockers.push("No next action defined");
  }

  // Blockers (20 points)
  if (thread.metadata.blocker) {
    blockers.push(thread.metadata.blocker);
  } else {
    score += 20;
  }

  // Status (10 points)
  if (thread.status === "open") {
    score += 10;
  } else if (thread.status === "waiting") {
    score += 5;
    blockers.push("Waiting on external party");
  }

  // Determine status
  let status: ProjectHealth["status"];
  if (score >= 80) {
    status = "green";
  } else if (score >= 50) {
    status = "yellow";
  } else {
    status = "red";
  }

  // Determine momentum
  let momentum: ProjectHealth["momentum"];
  if (daysSinceUpdate === 0) {
    momentum = "accelerating";
  } else if (daysSinceUpdate <= 3) {
    momentum = "steady";
  } else if (daysSinceUpdate <= 7) {
    momentum = "stalling";
  } else {
    momentum = "stalled";
  }

  return {
    score,
    status,
    momentum,
    daysActive,
    daysSinceUpdate,
    blockers,
    nextAction: thread.metadata.nextAction ?? null,
  };
}

/**
 * Determine pipeline stage based on health and metadata
 */
export function determinePipelineStage(
  thread: Thread,
  health: ProjectHealth,
): PipelineStage {
  // Resolved or stalled = out of active pipeline
  if (thread.status === "resolved") {
    return "closing";
  }

  if (health.momentum === "stalled" || health.daysSinceUpdate > 14) {
    return "stalled";
  }

  // Check for closing signals in metadata
  const closingSignals = ["loi", "signed", "closing", "final", "approved"];
  const titleLower = thread.title.toLowerCase();
  const hasClosingSignal = closingSignals.some((signal) =>
    titleLower.includes(signal),
  );

  if (hasClosingSignal && health.status === "green") {
    return "closing";
  }

  return "active";
}

/**
 * Enrich thread with health and pipeline stage
 */
export function enrichThreadWithHealth(thread: Thread): ProjectWithHealth {
  const health = calculateProjectHealth(thread);
  const pipelineStage = determinePipelineStage(thread, health);

  return {
    ...thread,
    health,
    pipelineStage,
  };
}

/**
 * Get recommended tasks based on energy level and project priority
 */
export function getEnergyAwareTasks(
  projects: ProjectWithHealth[],
  energyLevel: "high" | "medium" | "low",
): ProjectWithHealth[] {
  const activeProjects = projects.filter((p) => p.pipelineStage === "active");

  switch (energyLevel) {
    case "high":
      // M&A deals, strategic decisions, complex negotiations
      return activeProjects
        .filter((p) => p.category === "M&A" || p.category === "Partnerships")
        .filter(
          (p) => p.health.status === "green" || p.health.status === "yellow",
        )
        .sort((a, b) => b.health.score - a.health.score)
        .slice(0, 3);

    case "medium":
      // Follow-ups, calls, moderate decisions
      return activeProjects
        .filter((p) => p.health.nextAction !== null)
        .filter(
          (p) =>
            p.health.momentum === "steady" || p.health.momentum === "stalling",
        )
        .sort((a, b) => b.health.daysSinceUpdate - a.health.daysSinceUpdate)
        .slice(0, 5);

    case "low":
      // Admin, cleanup, simple updates
      return activeProjects
        .filter(
          (p) => p.category === "Personal" || p.health.status === "yellow",
        )
        .filter((p) => p.health.blockers.length === 0)
        .sort((a, b) => a.wordCount - b.wordCount)
        .slice(0, 3);

    default:
      return [];
  }
}

/**
 * Calculate pipeline statistics
 */
export interface PipelineStats {
  total: number;
  active: number;
  stalled: number;
  closing: number;
  green: number;
  yellow: number;
  red: number;
  byCategory: Record<string, number>;
}

export function calculatePipelineStats(
  projects: ProjectWithHealth[],
): PipelineStats {
  const stats: PipelineStats = {
    total: projects.length,
    active: 0,
    stalled: 0,
    closing: 0,
    green: 0,
    yellow: 0,
    red: 0,
    byCategory: {},
  };

  for (const project of projects) {
    // Pipeline stage
    stats[project.pipelineStage]++;

    // Health status
    stats[project.health.status]++;

    // Category
    if (!stats.byCategory[project.category]) {
      stats.byCategory[project.category] = 0;
    }
    stats.byCategory[project.category]++;
  }

  return stats;
}
