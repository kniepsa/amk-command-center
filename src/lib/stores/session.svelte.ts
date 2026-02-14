/**
 * Session store with auto-save functionality
 * Tracks user's current state for "Resume where you left off" feature
 */

export interface SessionState {
  lastTabVisited: string | null;
  currentDate: string | null;
  draftEntry: string | null;
  draftTranscript: string | null;
  lastHabitsToggled: string[];
  lastContextFilter: string | null;
  lastSavedAt: string | null;
}

const STORAGE_KEY = "session-state";

/**
 * Load session state from localStorage (SSR-safe)
 */
function loadSession(): SessionState {
  if (typeof window === "undefined") {
    return getDefaultSession();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultSession();
    }

    const parsed = JSON.parse(stored) as SessionState;

    // Validate required fields
    if (typeof parsed !== "object" || parsed === null) {
      console.warn("Invalid session state, using defaults");
      return getDefaultSession();
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load session:", error);
    return getDefaultSession();
  }
}

/**
 * Get default session state
 */
function getDefaultSession(): SessionState {
  return {
    lastTabVisited: null,
    currentDate: null,
    draftEntry: null,
    draftTranscript: null,
    lastHabitsToggled: [],
    lastContextFilter: null,
    lastSavedAt: null,
  };
}

/**
 * Session state using Svelte 5 runes
 */
export const sessionStore = $state<SessionState>(loadSession());

/**
 * Save current session state to localStorage
 */
export function saveSession(): void {
  if (typeof window === "undefined") return;

  try {
    const stateToSave: SessionState = {
      ...sessionStore,
      lastSavedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error("Failed to save session:", error);
  }
}

/**
 * Load saved session state
 */
export function loadSessionState(): SessionState {
  return loadSession();
}

/**
 * Clear session state
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;

  Object.assign(sessionStore, getDefaultSession());
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if there's a saved session worth resuming
 */
export function hasSavedSession(): boolean {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;

  try {
    const parsed = JSON.parse(stored) as SessionState;

    // Check if there's meaningful state to resume
    return !!(
      parsed.draftEntry ||
      parsed.draftTranscript ||
      parsed.lastHabitsToggled?.length > 0 ||
      parsed.lastTabVisited
    );
  } catch {
    return false;
  }
}

/**
 * Get a human-readable summary of what can be resumed
 */
export function getResumeSummary(): string {
  const state = loadSession();
  const parts: string[] = [];

  if (state.draftEntry) {
    parts.push("unsaved entry");
  }

  if (state.draftTranscript) {
    parts.push("interrupted recording");
  }

  if (state.lastHabitsToggled?.length > 0) {
    parts.push(`${state.lastHabitsToggled.length} habits marked`);
  }

  if (state.lastTabVisited) {
    parts.push(`on ${state.lastTabVisited} tab`);
  }

  if (parts.length === 0) {
    return "your last session";
  }

  return parts.join(", ");
}

/**
 * Update session state helpers
 */
export function setLastTab(tab: string): void {
  sessionStore.lastTabVisited = tab;
}

export function setCurrentDate(date: string): void {
  sessionStore.currentDate = date;
}

export function setDraftEntry(entry: string | null): void {
  sessionStore.draftEntry = entry;
}

export function setDraftTranscript(transcript: string | null): void {
  sessionStore.draftTranscript = transcript;
}

export function addHabitToggled(habitId: string): void {
  if (!sessionStore.lastHabitsToggled.includes(habitId)) {
    sessionStore.lastHabitsToggled.push(habitId);
  }
}

export function clearHabitsToggled(): void {
  sessionStore.lastHabitsToggled = [];
}

export function setContextFilter(filter: string | null): void {
  sessionStore.lastContextFilter = filter;
}

/**
 * Resume helpers
 */
export function restoreSession(): void {
  // Session is already loaded into sessionStore
  // Components can read from sessionStore to restore state
  console.log("Session restored:", sessionStore);
}
