import { browser } from "$app/environment";

/**
 * Type-safe localStorage persistence utility for Svelte 5 runes
 * Based on best practices from Svelte docs and community patterns
 */

/**
 * Helper to save state to localStorage (call from component $effect)
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
  if (!browser) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage (key: ${key}):`, error);
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllData(): void {
  if (!browser) return;

  const keys = [
    "amk-contacts",
    "amk-interactions",
    "amk-morning-reviews",
    "amk-evening-reviews",
    "amk-weekly-plans",
  ];

  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  });
}

/**
 * Export all app data as JSON for backup
 */
export function exportData(): string | null {
  if (!browser) return null;

  try {
    const data: Record<string, unknown> = {};

    [
      "amk-contacts",
      "amk-interactions",
      "amk-morning-reviews",
      "amk-evening-reviews",
      "amk-weekly-plans",
    ].forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        data[key] = JSON.parse(item);
      }
    });

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Failed to export data:", error);
    return null;
  }
}

/**
 * Import data from JSON backup
 */
export function importData(jsonString: string): {
  success: boolean;
  error?: string;
} {
  if (!browser) return { success: false, error: "Not in browser environment" };

  try {
    const data = JSON.parse(jsonString);

    if (typeof data !== "object" || data === null) {
      return { success: false, error: "Invalid data format" };
    }

    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
