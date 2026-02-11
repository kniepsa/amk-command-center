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

// ============================================================================
// API Request/Response Types (for Command Center V2 endpoints)
// ============================================================================

export interface ExtractEntryRequest {
  date: string; // YYYY-MM-DD format
  text: string; // Raw voice transcript or typed text
  existing?: Partial<HabitData>; // Partial entry data to merge with
}

export interface ExtractedData {
  sleep?: Partial<HabitData["sleep"]>;
  energy?: HabitData["energy"];
  habits?: Partial<HabitData["habits"]>;
  intentions?: string[];
  gratitude?: Array<{ thing: string; why: string }>;
  food?: Array<{
    time: string;
    meal: string;
    portion_grams?: number[];
    usda_ids?: string[];
  }>;
}

export interface ExtractEntryResponse {
  extracted: ExtractedData;
  confidence: number; // 0.0 to 1.0
  suggestions?: string[]; // Helpful suggestions for user
}

export interface WeeklyPriority {
  id: string; // e.g., "w06-p1"
  text: string; // Priority description
  days_active: number; // How many days this week worked on it
  total_days: number; // Total days in week (usually 7)
  progress_percent: number; // days_active / total_days * 100
  status?: "in_progress" | "completed" | "blocked" | "dropped";
}

export interface CurrentWeekResponse {
  week: string;
  priorities: WeeklyPriority[];
}

export interface LinkWeeklyRequest {
  date: string; // YYYY-MM-DD
  intention: string; // Daily intention text
  weekly_priority_id: string; // e.g., "w06-p1"
}

export interface LinkWeeklyResponse {
  success: boolean;
  updated_progress: number; // New days_active count
  message?: string;
}
