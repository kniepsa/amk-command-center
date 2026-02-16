/**
 * localStorage to Backend Migration Utility
 * One-time migration of localStorage data to backend API
 */

import { browser } from "$app/environment";
import type { Decision } from "$lib/utils/decision-tracker";
import type { Achievement } from "$lib/stores/achievements";

export interface MigrationData {
  decisions: Decision[];
  achievements: Achievement[];
  contacts: unknown[];
  interactions: unknown[];
  morningReviews: unknown[];
  eveningReviews: unknown[];
  weeklyPlans: unknown[];
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  if (!browser) return false;

  const keysToCheck = [
    "amk-decisions",
    "amk-command-center-achievements",
    "amk-contacts",
    "amk-interactions",
    "amk-morning-reviews",
    "amk-evening-reviews",
    "amk-weekly-plans",
  ];

  return keysToCheck.some((key) => {
    const value = localStorage.getItem(key);
    return value !== null && value !== "[]" && value !== "{}";
  });
}

/**
 * Extract all data from localStorage
 */
export function extractMigrationData(): MigrationData {
  if (!browser) {
    return {
      decisions: [],
      achievements: [],
      contacts: [],
      interactions: [],
      morningReviews: [],
      eveningReviews: [],
      weeklyPlans: [],
    };
  }

  const safeGet = <T>(key: string): T[] => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return [];
      const parsed = JSON.parse(item);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Failed to parse ${key}:`, error);
      return [];
    }
  };

  return {
    decisions: safeGet<Decision>("amk-decisions"),
    achievements: safeGet<Achievement>("amk-command-center-achievements"),
    contacts: safeGet("amk-contacts"),
    interactions: safeGet("amk-interactions"),
    morningReviews: safeGet("amk-morning-reviews"),
    eveningReviews: safeGet("amk-evening-reviews"),
    weeklyPlans: safeGet("amk-weekly-plans"),
  };
}

/**
 * Get migration summary for display
 */
export function getMigrationSummary(): {
  itemCounts: Record<string, number>;
  totalItems: number;
} {
  const data = extractMigrationData();

  const itemCounts = {
    decisions: data.decisions.length,
    achievements: data.achievements.length,
    contacts: data.contacts.length,
    interactions: data.interactions.length,
    morningReviews: data.morningReviews.length,
    eveningReviews: data.eveningReviews.length,
    weeklyPlans: data.weeklyPlans.length,
  };

  const totalItems = Object.values(itemCounts).reduce((a, b) => a + b, 0);

  return { itemCounts, totalItems };
}

/**
 * Clear migrated data from localStorage
 * ONLY call this after successful backend upload
 */
export function clearMigratedData(): void {
  if (!browser) return;

  const keysToRemove = [
    "amk-decisions",
    "amk-command-center-achievements",
    "amk-contacts",
    "amk-interactions",
    "amk-morning-reviews",
    "amk-evening-reviews",
    "amk-weekly-plans",
  ];

  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
      console.log(`[Migration] Removed ${key}`);
    } catch (error) {
      console.error(`[Migration] Failed to remove ${key}:`, error);
    }
  });

  // Mark migration as complete
  localStorage.setItem("migration-completed", new Date().toISOString());
}

/**
 * Check if migration was already completed
 */
export function isMigrationComplete(): boolean {
  if (!browser) return false;
  return localStorage.getItem("migration-completed") !== null;
}

/**
 * Export data as JSON for manual backup
 */
export function exportDataAsJSON(): string {
  const data = extractMigrationData();
  return JSON.stringify(data, null, 2);
}

/**
 * Download data as JSON file
 */
export function downloadDataBackup(): void {
  const json = exportDataAsJSON();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `amk-command-center-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate data before migration
 */
export function validateMigrationData(data: MigrationData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate decisions
  data.decisions.forEach((decision, index) => {
    if (!decision.id) errors.push(`Decision ${index}: Missing ID`);
    if (!decision.date) errors.push(`Decision ${index}: Missing date`);
    if (!decision.decision)
      errors.push(`Decision ${index}: Missing decision text`);
  });

  // Validate achievements
  data.achievements.forEach((achievement, index) => {
    if (!achievement.id) errors.push(`Achievement ${index}: Missing ID`);
    if (typeof achievement.unlocked !== "boolean") {
      errors.push(`Achievement ${index}: Invalid unlocked status`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
