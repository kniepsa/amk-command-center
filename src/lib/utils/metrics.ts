/**
 * Metrics calculation and visualization utilities
 */

export interface StreakColors {
  excellent: string; // 80-100%
  good: string; // 50-79%
  moderate: string; // 25-49%
  poor: string; // 0-24%
}

const STREAK_COLORS: StreakColors = {
  excellent: "bg-green-500",
  good: "bg-blue-500",
  moderate: "bg-yellow-500",
  poor: "bg-red-500",
};

export function getStreakColor(current: number, best: number): string {
  const percentage = (current / best) * 100;
  if (percentage >= 80) return STREAK_COLORS.excellent;
  if (percentage >= 50) return STREAK_COLORS.good;
  if (percentage >= 25) return STREAK_COLORS.moderate;
  return STREAK_COLORS.poor;
}

export function getEnergyColor(score: number): string {
  if (score === 3) return "bg-green-500"; // High
  if (score === 2) return "bg-blue-500"; // Medium
  if (score === 1) return "bg-yellow-500"; // Low
  return "bg-red-500"; // Drained/0
}

export function getSleepColor(hours: number): string {
  if (hours >= 8) return "bg-green-500"; // Excellent
  if (hours >= 7) return "bg-blue-500"; // Good
  if (hours >= 6) return "bg-yellow-500"; // Fair
  return "bg-red-500"; // Poor
}

/**
 * Calculate week number from date
 */
export function getWeekNumber(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return weekNo.toString().padStart(2, "0");
}
