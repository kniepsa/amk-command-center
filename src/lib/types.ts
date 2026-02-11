// Data types for AMK Command Center

export interface Contact {
  handle: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  tags: string[];
  notes: string;
  created: string;
  updated: string;
}

export interface Interaction {
  id: string;
  contact: string;
  date: string;
  summary: string;
  next_action?: string;
  tags: string[];
  created: string;
}

export interface HabitData {
  date: string;
  energy: "high" | "medium" | "low" | "drained";
  habits: {
    running: boolean;
    sauna: boolean;
    sales_learning: boolean;
    journaling: boolean;
    three_daily_happiness: boolean;
    vampire_shot: boolean;
    morning_electrolytes: boolean;
    supplements: boolean;
    plan_tomorrow: boolean;
    plan_next_week: boolean;
  };
  sleep: {
    bedtime: string;
    wake_time: string;
    duration: number;
    quality: "poor" | "fair" | "good" | "excellent";
    blue_blockers: boolean;
    screen_curfew: boolean;
  };
  intentions: string[];
  gratitude: Array<{
    thing: string;
    why: string;
  }>;
}

export interface FoodEntry {
  id: string;
  date: string;
  time: string;
  meal: string;
  category?: "breakfast" | "lunch" | "dinner" | "snack";
  estimated_protein?: number;
  portion_grams?: number[];
  usda_ids?: string[];
  notes?: string;
}

export interface WeeklyPlan {
  week: string; // e.g., "2026-W06"
  year: number;
  priorities: Array<{
    title: string;
    area: string;
    status: "pending" | "in_progress" | "completed" | "dropped";
  }>;
  parking_lot: string[];
  dropped: string[];
}

export interface LeadershipChallenge {
  date: string;
  source: "bill-campbell" | "peter-drucker" | "machiavelli";
  challenge: string;
  response?: string;
  completed: boolean;
}
