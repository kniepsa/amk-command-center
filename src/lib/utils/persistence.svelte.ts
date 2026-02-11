import { browser } from "$app/environment";

/**
 * Type-safe localStorage persistence utility for Svelte 5 runes
 * Based on best practices from Svelte docs and community patterns
 */

export interface PersistenceOptions<T> {
  key: string;
  defaultValue: T;
  validate?: (value: unknown) => value is T;
  onError?: (error: Error) => void;
}

/**
 * Creates a persisted reactive state that auto-syncs with localStorage
 * Only runs in browser environment (SSR-safe)
 *
 * @example
 * const contacts = createPersistedState({
 *   key: 'amk-contacts',
 *   defaultValue: INITIAL_CONTACTS,
 *   validate: (v): v is Contact[] => Array.isArray(v)
 * });
 */
export function createPersistedState<T>(options: PersistenceOptions<T>) {
  const { key, defaultValue, validate, onError } = options;

  // Initialize from localStorage (browser only)
  function loadFromStorage(): T {
    if (!browser) return defaultValue;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;

      const parsed = JSON.parse(stored);

      // Validate if validation function provided
      if (validate && !validate(parsed)) {
        console.warn(
          `Invalid data in localStorage for key "${key}", using default`,
        );
        return defaultValue;
      }

      return parsed;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to load from localStorage (key: ${key}):`, err);
      onError?.(err);
      return defaultValue;
    }
  }

  const state = $state<T>(loadFromStorage());

  // Auto-save to localStorage on changes (browser only)
  if (browser) {
    $effect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`Failed to save to localStorage (key: ${key}):`, err);
        onError?.(err);
      }
    });
  }

  return state;
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
