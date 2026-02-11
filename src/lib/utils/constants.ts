/**
 * Application-wide constants
 * Eliminates magic numbers and centralizes configuration
 */

// Weekly Planning (Warren Buffett 25/5)
export const MAX_WEEKLY_PRIORITIES = 7;
export const MIN_WEEKLY_PRIORITIES = 5;

// CRM Follow-up thresholds
export const FOLLOW_UP_THRESHOLD_DAYS = 30;

// Sleep validation
export const MIN_SLEEP_HOURS = 3;
export const MAX_SLEEP_HOURS = 14;
export const IDEAL_MIN_SLEEP_HOURS = 7;
export const IDEAL_MAX_SLEEP_HOURS = 9;

// Gratitude journal
export const MIN_GRATITUDE_ITEMS = 2;
export const MAX_GRATITUDE_ITEMS = 5;

// Intentions
export const MIN_INTENTIONS = 1;
export const MAX_INTENTIONS = 3;

// Component size limits (for code review)
export const MAX_COMPONENT_LINES = 250;

// localStorage keys
export const STORAGE_KEYS = {
  CONTACTS: "amk-contacts",
  INTERACTIONS: "amk-interactions",
  MORNING_REVIEWS: "amk-morning-reviews",
  EVENING_REVIEWS: "amk-evening-reviews",
  WEEKLY_PLANS: "amk-weekly-plans",
} as const;

// Energy levels
export type EnergyLevel = "high" | "medium" | "low" | "drained";
export type SleepQuality = "excellent" | "good" | "fair" | "poor";

// Color mapping for UI consistency
export const ENERGY_COLORS: Record<EnergyLevel, string> = {
  high: "border-green-500 bg-green-50",
  medium: "border-blue-500 bg-blue-50",
  low: "border-yellow-500 bg-yellow-50",
  drained: "border-red-500 bg-red-50",
};

export const SLEEP_QUALITY_COLORS: Record<SleepQuality, string> = {
  excellent: "border-green-500 bg-green-50",
  good: "border-blue-500 bg-blue-50",
  fair: "border-yellow-500 bg-yellow-50",
  poor: "border-red-500 bg-red-50",
};

// Priority task category colors
export const TASK_CATEGORY_COLORS = {
  priority: "bg-green-50 border-green-200",
  parking: "bg-yellow-50 border-yellow-200",
  drop: "bg-red-50 border-red-200",
  braindump: "bg-slate-50",
} as const;
