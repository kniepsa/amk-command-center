/**
 * Journal API Client
 *
 * Connects to AMK Journal API for content ideas and other journal data
 */

const JOURNAL_API_URL =
  import.meta.env.VITE_JOURNAL_API_URL || "http://localhost:3001";
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
