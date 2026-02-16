/**
 * Journal API Client
 *
 * Connects to AMK Journal API for content ideas, entry extraction, and other journal data
 */

const JOURNAL_API_URL =
  import.meta.env.VITE_JOURNAL_API_URL || "http://localhost:3002";
const API_KEY =
  import.meta.env.VITE_JOURNAL_API_KEY ||
  "test-key-for-command-center-integration";

export interface ContentIdea {
  id: string;
  idea: string;
  icp: string; // "B2B Founders" | "Expat RE Investors" | "Print Shop Owners" | "Technical Parents"
  hook: string;
  category: string;
  source_date: string;
  source_file: string;
}

export interface JournalApiError {
  error: string;
  details?: unknown;
}

export interface ExtractedData {
  sleep?: {
    bedtime?: string;
    wake_time?: string;
    duration?: number;
    quality?: "poor" | "fair" | "good" | "excellent";
    blue_blockers?: boolean;
    screen_curfew?: boolean;
  };
  energy?: "high" | "medium" | "low" | "drained";
  habits?: {
    running?: boolean;
    sauna?: boolean;
    sales_learning?: boolean;
    journaling?: boolean;
    three_daily_happiness?: boolean;
    vampire_shot?: boolean;
    morning_electrolytes?: boolean;
    supplements?: boolean;
    plan_tomorrow?: boolean;
    plan_next_week?: boolean;
  };
  intentions?: string[];
  gratitude?: Array<{ thing: string; why: string }>;
  food?: Array<{
    time: string;
    meal: string;
    portion_grams?: number[];
    usda_ids?: string[];
  }>;
  work_log?: Array<{
    thread: string;
    time_spent: string | null;
    progress: string | null;
  }>;
  tags?: string[];
  people?: string[];
  frameworks?: string[];
  contexts?: Array<
    "calls" | "online" | "office" | "home" | "anywhere" | "waiting"
  >;
  _uncertain?: Array<{
    field: string;
    value: unknown;
    question: string;
    confidence: number;
    type?: "choice" | "text";
    options?: string[];
  }>;
  _needsClarification?: boolean;
}

export interface ExtractionResult {
  extracted: ExtractedData;
  confidence: number;
  suggestions?: string[];
  cached?: boolean;
}

/**
 * Extract structured data from transcription
 */
export async function extractEntryData(
  transcription: string,
  date: string,
): Promise<ExtractionResult> {
  try {
    const response = await fetch(`${JOURNAL_API_URL}/api/v1/entries/extract`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcription,
        date,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Extraction failed: ${response.status}`,
      );
    }

    const data = await response.json();

    // Handle API error response
    if ("error" in data) {
      throw new Error((data as JournalApiError).error);
    }

    return data as ExtractionResult;
  } catch (error) {
    console.error("Failed to extract entry data:", error);
    throw error;
  }
}

/**
 * Fetch content ideas from Journal API
 */
export async function fetchContentIdeas(): Promise<ContentIdea[]> {
  try {
    const response = await fetch(`${JOURNAL_API_URL}/content-ideas`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle API error response
    if ("error" in data) {
      throw new Error((data as JournalApiError).error);
    }

    // API returns { ideas: [], count: number }
    // Extract the ideas array
    if ("ideas" in data && Array.isArray(data.ideas)) {
      return data.ideas as ContentIdea[];
    }

    // Fallback: if data is already an array, use it
    if (Array.isArray(data)) {
      return data as ContentIdea[];
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch content ideas:", error);
    throw error;
  }
}

/**
 * Check if Journal API is accessible
 */
export async function checkJournalApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${JOURNAL_API_URL}/health`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Weekly Planning Types
 */
export interface WeeklyPriority {
  title: string;
  area: string;
  status: "pending" | "in_progress" | "completed" | "dropped";
}

export interface WeeklyPlan {
  week: string; // e.g., "2026-W07"
  year: number;
  priorities: WeeklyPriority[];
  parking_lot: string[];
  dropped: string[];
  validation?: {
    is_valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface WeeklySummary {
  current_week: WeeklyPlan | null;
  next_week: WeeklyPlan | null;
  focus_health: {
    top_priorities_count: number;
    is_within_limit: boolean;
  };
}

/**
 * Get current week's plan (Warren Buffett 25/5)
 */
export async function getWeeklyPlan(): Promise<WeeklyPlan | null> {
  try {
    const response = await fetch(`${JOURNAL_API_URL}/api/v1/weekly/current`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No weekly plan exists yet
        return null;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as WeeklyPlan;
  } catch (error) {
    console.error("Failed to fetch weekly plan:", error);
    throw error;
  }
}

/**
 * Get weekly plan summary (current + next week)
 */
export async function getWeeklySummary(): Promise<WeeklySummary> {
  try {
    const response = await fetch(`${JOURNAL_API_URL}/api/v1/weekly/summary`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as WeeklySummary;
  } catch (error) {
    console.error("Failed to fetch weekly summary:", error);
    throw error;
  }
}

/**
 * Coach System Types
 */
export type ChallengeLevel = "low" | "medium" | "high";

export interface CoachConfig {
  id: string;
  name: string;
  enabled: boolean;
  challenge_level: ChallengeLevel;
  triggers: string[];
  auto_activate: boolean;
}

export interface CoachSettings {
  show_immediately: boolean;
  allow_debates: boolean;
  max_coaches_per_response: number;
}

export interface CoachesConfig {
  active_coaches: CoachConfig[];
  settings: CoachSettings;
}

export interface DailyCoach {
  id: string;
  name: string;
  icon: string;
  recommendation: string;
  perspectives: {
    observation: string;
    challenge: string;
    why: string;
  };
}

/**
 * Get coach configuration for a workspace
 */
export async function getCoachConfig(
  workspaceId: string = "amk",
): Promise<CoachesConfig> {
  try {
    const response = await fetch(
      `${JOURNAL_API_URL}/api/v1/coaches/config?workspace_id=${workspaceId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as CoachesConfig;
  } catch (error) {
    console.error("Failed to fetch coach config:", error);
    throw error;
  }
}

/**
 * Update coach configuration for a workspace
 */
export async function updateCoachConfig(
  workspaceId: string,
  config: CoachesConfig,
): Promise<{ success: boolean; config: CoachesConfig }> {
  try {
    const response = await fetch(`${JOURNAL_API_URL}/api/v1/coaches/config`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspace_id: workspaceId,
        config,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Update failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to update coach config:", error);
    throw error;
  }
}

/**
 * Get daily coach recommendations (demo data)
 */
export async function getDailyCoaches(): Promise<DailyCoach[]> {
  try {
    const response = await fetch(`${JOURNAL_API_URL}/api/v1/coaches/daily`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.coaches as DailyCoach[];
  } catch (error) {
    console.error("Failed to fetch daily coaches:", error);
    throw error;
  }
}
